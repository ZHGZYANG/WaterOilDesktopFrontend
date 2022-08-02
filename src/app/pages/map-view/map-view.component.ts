import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FilterModel, Photo, Tag} from "../../types/data";
import {MatChipInputEvent} from "@angular/material/chips";
import {NoteDialog, TagsDialog} from "../desktop/desktop.component";
import {FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validator, Validators} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {Title} from "@angular/platform-browser";
import {AlertController, LoadingController} from "@ionic/angular";
import {MatDialog} from "@angular/material/dialog";
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps';
import {Globals} from '../../global';
import {LocalStorageService} from "../../services/local-storage.service";
import {ModelService} from "../../services/model.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit {
  @ViewChild('myGoogleMap', {static: false}) map!: GoogleMap;
  @ViewChild(MapInfoWindow, {static: false}) info!: MapInfoWindow;

  form: UntypedFormGroup;
  geoForm: FormGroup;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];

  //apiLoaded: Observable<boolean>;
  zoom = 6;
  center!: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    clickableIcons: true,
    maxZoom: 2000,
    minZoom: 2,
  };
  markers = [] as any;

  photoGpsForFilter = '';

  // meta for global list
  photoList: Photo[] = [];
  currentPage: number;
  totalPage: number;
  currentFilterModel: FilterModel;

  // meta for date filter
  mindate: string;
  maxdate: string;
  // meta for tags filter
  tagList: string;
  // meta for notes filter
  querystring: string;
  // meta for geo filter
  last_token: string;
  next_token: string;

  SERVERSINGLEPHOTO = false;

  singlePhoto: Photo;

  constructor(private alertCtrl: AlertController, private titleService: Title, private loadingController: LoadingController, private router: Router,
              public noteDialog: MatDialog, public tagsDialog: MatDialog, private route: ActivatedRoute,
              httpClient: HttpClient, public global: Globals, private datePipe: DatePipe,
              private localStorageService: LocalStorageService, private modelServise: ModelService,) {
    this.titleService.setTitle('Map - Wateroil Management System');

    //this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=' + this.global.mapToken, 'callback')
    //  .pipe(
    //    map(() => true),
    //    catchError(() => of(false)),
    //  );
    this.form = new UntypedFormGroup({
      // @ts-ignore
      start: new UntypedFormControl<Date | null>(null),
      // @ts-ignore
      end: new UntypedFormControl<Date | null>(null),
      notes: new UntypedFormControl(''),
      selector: new FormControl(''),
    });
    this.geoForm = new FormGroup({
      radius: new FormControl('', Validators.required),
      radiusUnit: new FormControl('', Validators.required),
    });
    this.currentPage = 0;
    this.totalPage = 1;
    this.mindate = '-';
    this.maxdate = '-';
    this.tagList = '';
    this.querystring = '';
    this.next_token = '';
    this.last_token = '';
    this.currentFilterModel = FilterModel.Date;
    this.singlePhoto = {
      id: 'null',
      path: 'null',
      gps: 'null',
      date: 'null',
      result: 'null',
      notes: 'null',
      tags: 'null',
      username: 'null',
    };
  }

  ngOnInit(): void {
    if (!this.localStorageService.loggedIn()) {
      this.router.navigateByUrl('login');
      return;
    }
    this.loadingfun();
    let gpsString = this.route.snapshot.params['id'];
    if (gpsString === 'global') {
      this.requestDispatch('global');
    } else if (gpsString.split('-')[0] === 'specific') {
      this.requestDispatch(gpsString);
    } else {
      alert('Illegal Request!');
      this.router.navigateByUrl('');
    }

    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
    });
  }

  getPhotoListByDate() {
    if (this.currentPage < this.totalPage)
      this.modelServise.getPhotoList(this.mindate, this.maxdate, (this.currentPage + 1).toString()).subscribe({
        next: data => {
          if (data.status == 8) {
            alert("Login Timeout!");
            this.router.navigateByUrl('login');
          } else if (data.status != 0) {
            this.presentAlert('Retrieve data failed', data.msg);
          } else {
            this.currentPage = parseInt(data.meta.current_page);
            this.totalPage = parseInt(data.meta.total_page);
            for (var item in data.msg) {
              let photo: Photo = {
                id: data.msg[item].id,
                path: data.msg[item].path,
                gps: data.msg[item].gps,
                date: data.msg[item].date,
                result: data.msg[item].result,
                notes: data.msg[item].notes,
                tags: data.msg[item].tags,
                username: data.msg[item].username,
              };
              this.photoList.push(photo);
            }
            this.addMarker();
          }
        },
        error: _ => {
          this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
            'your network is not stable, please refresh page.');
        },
      });
  }


  addMarker() {
    for (var i of this.photoList) {
      this.markers.push({
        position: {
          lat: +i.gps.split(',')[0],
          lng: +i.gps.split(',')[1]
        },
        visible: true,
        opacity: 1.0,
        label: {
          color: 'red',
          text: ' ',
        },
        title: 'ID: ' + i.id,
        options: {
          draggable: false,
          icon: {
            url: this.global.domain + '/' + i.path,
            scaledSize: new google.maps.Size(75, 90),
            // origin: new google.maps.Point(0,0),
            // anchor: new google.maps.Point(0, 0)
          }
        },
        info: i.gps,
        data: i,
        // data: {
        //   id: photoList[i].id,
        //   path: photoList[i].path,
        //   date: photoList[i].date,
        //   result: photoList[i].result,
        //   note: photoList[i].note,
        //   username: photoList[i].username,
        //   tags: photoList[i].tags
        // }
      });
      // this.markers[i].addListener("click", () => {
      //   this.showImageDetails(photoList[i].id, photoList[i].path, photoList[i].date,
      //     photoList[i].result, photoList[i].note, photoList[i].username, photoList[i].tags);
      // });
    }
  }

  openInfo(marker: MapMarker, gps: string, data: Photo) {
    this.photoGpsForFilter = gps;
    this.info.open(marker);
    document.getElementById('image-details')!.style.display = 'block';
    document.getElementById('image-list')!.style.height = '65vh';
    document.getElementById('hide-image-details')!.style.display = 'inline';
    this.singlePhoto = data;
  }

  onSubmit() {
    if (this.form.controls['selector'].value == 'date') {
      if (this.form.controls['start'].value != null && this.form.controls['end'].value != null) {
        this.currentFilterModel = FilterModel.Date;
        this.loadingfun();
        this.mindate = this.datePipe.transform(this.form.controls['start'].value, "yyyy-MM-dd")!.toString();
        this.maxdate = this.datePipe.transform(this.form.controls['end'].value, "yyyy-MM-dd")!.toString();
        this.currentPage = 0;
        this.totalPage = 1;
        this.photoList = [];
        this.requestDispatch('filter');
      } else {
        this.presentAlert('Invalid field', 'Please correct your date range');
      }
    } else if (this.form.controls['selector'].value == 'notes') {
      if (this.form.controls['notes'].value != '') {
        this.currentFilterModel = FilterModel.Notes;
        this.loadingfun();
        this.querystring = this.form.controls['notes'].value;
        this.currentPage = 0;
        this.totalPage = 1;
        this.photoList = [];
        this.requestDispatch('filter');
      } else {
        this.presentAlert('Invalid field', 'Please input note');
      }
    } else if (this.form.controls['selector'].value == 'tags') {
      if (this.tags.length != 0) {
        this.currentFilterModel = FilterModel.Tags;
        this.loadingfun();
        this.tagList = '';
        for (var item in this.tags) {
          this.tagList += '#' + this.tags[item].name;
        }
        this.currentPage = 0;
        this.totalPage = 1;
        this.photoList = [];
        this.requestDispatch('filter');
      } else {
        this.presentAlert('Invalid field', 'Please input tags');
      }
    } else {
      this.presentAlert('Field missed', 'Please choose a filter');
    }
  }

  onGeoSubmit() {
    if (this.geoForm.valid) {
      this.currentFilterModel = FilterModel.Geo;
      this.loadingfun();
      this.last_token = '-';
      this.next_token = '-';
      this.photoList = [];
      this.requestDispatch('filter');
    } else {
      this.presentAlert('Field missing', 'Please check your input');
    }
  }

  getPhotoListByNotes() {
    if (this.currentPage < this.totalPage)
      this.modelServise.searchFilterNote(this.querystring, (this.currentPage + 1).toString()).subscribe({
        next: data => {
          if (data.status == 8) {
            alert("Login Timeout!");
            this.router.navigateByUrl('login');
          } else if (data.status != 0) {
            this.presentAlert('Retrieve data failed', data.msg);
          } else {
            this.currentPage = parseInt(data.meta.current_page);
            this.totalPage = parseInt(data.meta.total_page);
            for (var item in data.msg) {
              let photo: Photo = {
                id: data.msg[item].id,
                path: data.msg[item].path,
                gps: data.msg[item].gps,
                date: data.msg[item].date,
                result: data.msg[item].result,
                notes: data.msg[item].notes,
                tags: data.msg[item].tags,
                username: data.msg[item].username,
              };
              this.photoList.push(photo);
            }
            this.addMarker();
          }
        },
        error: _ => {
          this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
            'your network is not stable, please refresh page.');
        },
      });
  }

  getPhotoListByTags() {
    this.modelServise.searchFilterTag(this.tagList).subscribe({
      next: data => {
        if (data.status == 8) {
          alert("Login Timeout!");
          this.router.navigateByUrl('login');
        } else if (data.status != 0) {
          this.presentAlert('Retrieve data failed', data.msg);
        } else {
          for (var item in data.msg) {
            let photo: Photo = {
              id: data.msg[item].id,
              path: data.msg[item].path,
              gps: data.msg[item].gps,
              date: data.msg[item].date,
              result: data.msg[item].result,
              notes: data.msg[item].notes,
              tags: data.msg[item].tags,
              username: data.msg[item].username,
            };
            this.photoList.push(photo);
          }
          this.addMarker();
        }
      },
      error: _ => {
        this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
          'your network is not stable, please refresh page.');
      },
    });
  }

  requestDispatch(model: string) {
	this.markers = [];
    if (model == 'filter') {
      switch (this.currentFilterModel) {
        case FilterModel.Tags:
          this.getPhotoListByTags();
          break;
        case FilterModel.Notes:
          this.getPhotoListByNotes();
          break;
        case FilterModel.Date:
          this.getPhotoListByDate();
          break;
        case FilterModel.Geo:
          this.getPhotoListByGeo();
      }
    } else if (model == 'global') {
      this.getPhotoListByDate();
    } else {
      let id = model.split('-')[1];
      this.getSinglePhoto(id);
    }
  }

  getPhotoListByGeo() {
    this.modelServise.searchFilterGeo(this.singlePhoto.gps, this.geoForm.controls['radius'].value, this.geoForm.controls['radiusUnit'].value, this.last_token, this.next_token).subscribe({
      next: data => {
        if (data.status == 8) {
          alert("Login Timeout!");
          this.router.navigateByUrl('login');
        } else if (data.status != 0) {
          this.presentAlert('Retrieve data failed', data.msg);
        } else {
          this.next_token = data.meta.next_token;
          for (var item in data.msg) {
            let photo: Photo = {
              id: data.msg[item].id,
              path: data.msg[item].path,
              gps: data.msg[item].gps,
              date: data.msg[item].date,
              result: data.msg[item].result,
              notes: data.msg[item].notes,
              tags: data.msg[item].tags,
              username: data.msg[item].username,
            };
            this.photoList.push(photo);
          }
          this.addMarker();
        }
      },
      error: _ => {
        this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
          'your network is not stable, please refresh page.');
      },
    });
  }

  getSinglePhoto(id: string) {
    if (this.SERVERSINGLEPHOTO) {
      this.modelServise.getPhoto(id);
    } else {
      this.photoList = []
      this.singlePhoto = this.localStorageService.getPhoto();
      this.photoList.push(this.singlePhoto)
    }
    // this.center = {
    //   lat: +this.singlePhoto.gps.split(',')[0],
    //   lng: +this.singlePhoto.gps.split(',')[1],
    // }
    this.addMarker();
  }

  photoUpload() {
    this.router.navigateByUrl('upload');
  }

  listView() {
    this.router.navigateByUrl('');
  }

  logout() {
    this.modelServise.logout();
    this.localStorageService.removeCurrentUser();
    this.router.navigateByUrl('login');
  }

  editNote(id: string, note: string, tags: string) {
    const noteDialogRef = this.noteDialog.open(NoteDialog, {
      width: '550px',
      data: {noteForEdit: note},
    });

    noteDialogRef.afterClosed().subscribe(result => {
      //update to backend
      if (result) {
        this.modelServise.updatePhotoInfo(id, result.slice(0, -1), tags).subscribe({
          next: data => {
            if (data.status == 8) {
              alert("Login Timeout!");
              this.router.navigateByUrl('login');
            } else if (data.status != 0) {
              this.presentAlert('Failed', data.msg);
            } else {
              this.presentAlert('Succeed', data.msg+' Please refresh page for newest results.');
            }
          },
          error: _ => {
            this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
              'your network is not stable, please refresh page.');
          },
        });
      }
    });
  }

  editTags(id: string, tags: string, note: string) {
    let tagsTmp: Tag[] = [];
    if (tags != '' && tags != null) {
      let tagsList = tags.split('#');
      for (let i = 1; i < tagsList.length; i++) {
        tagsTmp.push({name: tagsList[i]});
      }
    }
    const tagDialogRef = this.tagsDialog.open(TagsDialog, {
      width: '550px',
      data: {tagsForEdit: tagsTmp},
    });

    tagDialogRef.afterClosed().subscribe(result => {
      //update to backend
      let tagString = '';
      for (let i = 0; i < result.length; i++) {
        tagString += '#' + result[i].name;
      }
      this.modelServise.updatePhotoInfo(id, note, tagString).subscribe({
        next: data => {
          if (data.status == 8) {
            alert("Login Timeout!");
            this.router.navigateByUrl('login');
          } else if (data.status != 0) {
            this.presentAlert('Failed', data.msg);
          } else {
            this.presentAlert('Succeed', data.msg+' Please refresh page for newest results.');
          }
        },
        error: _ => {
          this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
            'your network is not stable, please refresh page.');
        },
      });
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push({name: value});
    }
    event.chipInput!.clear();
  }

  remove(tag: Tag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  hideImageDetails() {
    const imageDetails = document.getElementById('image-details');
    const imageList = document.getElementById('image-list');
    const imageDetailsBtn = document.getElementById('hide-image-details');
    // @ts-ignore
    imageDetails.style.display = 'none';
    // @ts-ignore
    imageDetailsBtn.style.display = 'none';
    // @ts-ignore
    imageList.style.height = '93vh';
  }

  filter() {
    const filterBar = document.getElementById('filter-bar');
    const imageList = document.getElementById('image-list');
    const imageDetails = document.getElementById('image-details');
    // @ts-ignore
    if (filterBar.style.display === 'none') {
      // @ts-ignore
      filterBar.style.display = 'block';
      // @ts-ignore
      imageList.style.marginLeft = '25%';
      // @ts-ignore
      imageList.style.width = '75%';
      // @ts-ignore
      imageDetails.style.width = '75%';
      // @ts-ignore
      imageDetails.style.marginLeft = '25%';
    } else {
      // @ts-ignore
      filterBar.style.display = 'none';
      // @ts-ignore
      imageList.style.marginLeft = '0';
      // @ts-ignore
      imageList.style.width = '100%';
      // @ts-ignore
      imageDetails.style.width = '100%';
      // @ts-ignore
      imageDetails.style.marginLeft = '0';
    }
  }

  async loadingfun() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();
  }

  presentAlert(header: string, msg: string) {
    const alert = this.alertCtrl.create({
      message: msg,
      subHeader: header,
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}
