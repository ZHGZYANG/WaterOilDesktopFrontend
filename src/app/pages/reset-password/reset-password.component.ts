import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, Subject, take, takeUntil} from 'rxjs';
import {LocalStorageService} from "../../services/local-storage.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModelService} from "../../services/model.service";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public resetValid = true;
  resetForm: FormGroup;
  alert = '';

  constructor(private alertCtrl: AlertController, private router: Router,
              private localStorageService: LocalStorageService, private modelServise: ModelService) {
    this.resetForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.resetValid = true;
    if (this.resetForm.valid) {
      this.modelServise.changePassword(this.resetForm.controls['username'].value, this.resetForm.controls['password'].value, this.resetForm.controls['email'].value)
        .subscribe({
          next: data => {
            if (data.status != 0) {
              this.alert = data.msg;
              this.resetValid = false;
            } else {
              this.router.navigateByUrl('login');
            }
          },
          error: _ => {
            this.alert = 'Your network is not stable, please try later.';
            this.resetValid = false;
          },
        });
    }
  }

  presentAlert() {
    const alert = this.alertCtrl.create({
      message: 'Username and password do not match!',
      subHeader: 'Login Failed',
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}
