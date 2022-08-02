import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage.service";
import {ModelService} from "../../services/model.service";
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import exifr from 'exifr';
import {AlertController} from "@ionic/angular";
import {HttpEvent, HttpEventType} from "@angular/common/http";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  uploadForm: FormGroup;
  photoName: string = 'Not selected';
  // @ts-ignore
  photo: File = null;
  progress: number = 0;

  constructor(private alertCtrl: AlertController, private localStorageService: LocalStorageService, private modelServise: ModelService,
              private router: Router,) {
    this.uploadForm = new FormGroup({
      gps: new FormControl(null, Validators.required),
      notes: new FormControl(null),
    });
  }

  ngOnInit() {
    if (!this.localStorageService.loggedIn()) {
      this.router.navigateByUrl('login');
    }
  }

  onFileSelected(event: any) {
    this.photo = event.target.files[0];
    this.photoName = this.photo.name;
  }

  validateGPS(): boolean {
    try {
      let lat = parseFloat(this.uploadForm.controls['gps'].value.replace(' ', '').split(',')[0]);
      let lon = parseFloat(this.uploadForm.controls['gps'].value.replace(' ', '').split(',')[1]);
      const isLatitude = (lat: number) => isFinite(lat) && Math.abs(lat) <= 90;
      const isLongitude = (num: number) => isFinite(num) && Math.abs(num) <= 180;
      return isLatitude(lat) && isLongitude(lon);
    } catch (e) {
      return false
    }
  }

  onSubmit() {
    if (this.validateGPS() && this.photo != null) {
      this.modelServise.upload(this.uploadForm.controls['gps'].value.replace(' ', ''), this.uploadForm.controls['notes'].value, this.photo)
        .subscribe((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              // console.log('Request has been made!');
              break;
            case HttpEventType.ResponseHeader:
              // console.log('Response header has been received!');
              break;
            case HttpEventType.UploadProgress:
              this.progress = Math.round(event.loaded / event.total! * 100);
              console.log(`Uploaded: ${this.progress}%`);
              break;
            case HttpEventType.Response:
              if (event.body.status == 0)
                this.presentAlert('Upload successful', 'The result is: ' + event.body.meta.result);
              else if (event.body.status == 8)
                this.router.navigateByUrl('login');
              else
                this.presentAlert('Error', event.body.msg);
              this.progress = 0;
          }
        });


      // this.modelServise.upload(this.uploadForm.controls['gps'].value.replace(' ', ''), this.uploadForm.controls['notes'].value, this.photo)
      //   .subscribe({
      //     next: data => {
      //       if (data.status != 0) {
      //         this.presentAlert('Error', data.msg)
      //       } else {
      //         this.presentAlert('Succeed', 'The result is ' + data.meta.result);
      //       }
      //     },
      //     error: _ => {
      //       this.presentAlert('Error', 'Your network is not stable, please try later.')
      //     },
      //   });
    } else {
      this.presentAlert('Field missing', 'Please input gps location and select a specific image.')
    }

  }

  photoUpload() {
    this.router.navigateByUrl('/upload');
  }

  listView() {
    this.router.navigateByUrl('');
  }

  logout() {
    this.modelServise.logout();
    this.localStorageService.removeCurrentUser();
    this.router.navigateByUrl('login');
  }

  presentAlert(header: string, msg: string) {
    const alert = this.alertCtrl.create({
      message: msg,
      subHeader: header,
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}
