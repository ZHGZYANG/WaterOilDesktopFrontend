import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
import {AlertController, LoadingController} from '@ionic/angular';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {FilterModel, NoteDialogData, Photo, Tag, TagsDialogData} from '../../types/data';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatAccordion} from '@angular/material/expansion';
import {LocalStorageService} from "../../services/local-storage.service";
import {ModelService} from "../../services/model.service";
import {Globals} from "../../global";

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.css']
})


export class DesktopComponent implements OnInit {
  @ViewChild(MatAccordion) accordion?: MatAccordion;
  form: UntypedFormGroup;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];

  // meta for global list
  photoList: Photo[] = [];
  photoDateList = new Set<string>();
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

  months = {
    '01': 'January', '02': 'February', '03': 'March', '04': 'April',
    '05': 'May', '06': 'June', '07': 'July', '08': 'August',
    '09': 'September', '10': 'October', '11': 'November', '12': 'December'
  }

  constructor(private alertCtrl: AlertController, private titleService: Title,
              private loadingController: LoadingController, private router: Router,
              public noteDialog: MatDialog, public tagsDialog: MatDialog,
              private localStorageService: LocalStorageService, private modelServise: ModelService,
              public global: Globals, private datePipe: DatePipe) {
    this.titleService.setTitle('Photo List - Wateroil Management System');
    this.currentPage = 0;
    this.totalPage = 1;
    this.mindate = '-';
    this.maxdate = '-';
    this.tagList = '';
    this.querystring = '';
    this.currentFilterModel = FilterModel.Date;
    this.form = new UntypedFormGroup({
      // @ts-ignore
      start: new UntypedFormControl<Date | null>(null),
      // @ts-ignore
      end: new UntypedFormControl<Date | null>(null),
      notes: new FormControl(''),
      selector: new FormControl(''),
    });
  }

  ngOnInit() {
    if (!this.localStorageService.loggedIn()) {
      this.router.navigateByUrl('login');
      return;
    }
    this.loadingfun();
    this.requestDispatch();
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
              this.photoDateList.add(data.msg[item].date);
            }
          }
        },
        error: _ => {
          this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
            'your network is not stable, please refresh page.');
        },
      });
  }

  transferDate(date: string): string {
    let month = date.split('-')[1];
    // @ts-ignore
    return this.months[month] + ' ' + date.split('-')[2] + ' ' + date.split('-')[0];
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
        this.photoDateList.clear();
        this.requestDispatch();
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
        this.photoDateList.clear();
        this.requestDispatch();
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
        this.photoDateList.clear();
        this.requestDispatch();
      } else {
        this.presentAlert('Invalid field', 'Please input tags');
      }
    } else {
      this.presentAlert('Field missed', 'Please choose a filter');
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
              this.photoDateList.add(data.msg[item].date);
            }
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
            this.photoDateList.add(data.msg[item].date);
          }
        }
      },
      error: _ => {
        this.presentAlert('Retrieve data failed', 'We cannot retrieve data from server because ' +
          'your network is not stable, please refresh page.');
      },
    });
  }

  requestDispatch() {
    switch (this.currentFilterModel) {
      case FilterModel.Date:
        this.getPhotoListByDate();
        break;
      case FilterModel.Notes:
        this.getPhotoListByNotes();
        break;
      case FilterModel.Tags:
        this.getPhotoListByTags()
    }
  }


  onScroll(event: any) {
    // visible height + pixel scrolled >= total height
    if (event.target.offsetHeight + event.target.scrollTop + 30 >= event.target.scrollHeight && this.currentFilterModel != FilterModel.Tags) {
      if (document.getElementById('loading')!.style.display === 'none') {
        document.getElementById('loading')!.style.display = 'block';
        this.requestDispatch();
        document.getElementById('loading')!.style.display = 'none';
      }
    }
  }

  photoUpload() {
    this.router.navigateByUrl('/upload');
  }

  mapView(photo: any) {
    if (photo == 'global') {
      this.router.navigateByUrl('/mapview/global');
    } else {
      this.localStorageService.setPhoto(<Photo>photo);
      this.router.navigateByUrl('/mapview/specific-' + photo.id);
    }
  }

  logout() {
    this.modelServise.logout();
    this.localStorageService.removeCurrentUser();
    this.router.navigateByUrl('login');
  }

  editNote(id: string, note: string, tags:string) {
    const noteDialogRef = this.noteDialog.open(NoteDialog, {
      width: '550px',
      data: {noteForEdit: note},
    });

    noteDialogRef.afterClosed().subscribe(result => {
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

  editTags(id: string, tags: string, note:string) {
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
      let tagString = '';
      for (var i = 0; i < result.length; i++) {
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

  filter() {
    const filterBar = document.getElementById('filter-bar')!;
    const imageList = document.getElementById('image-list')!;
    if (filterBar.style.display === 'none') {
      filterBar.style.display = 'block';
      imageList.style.marginLeft = '25%';
      imageList.style.width = '75%';
    } else {
      filterBar.style.display = 'none';
      imageList.style.marginLeft = '0';
      imageList.style.width = '100%';
      document.getElementById('loading')!.style.width = '100%';
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

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'note-dialog',
  templateUrl: 'note-dialog.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NoteDialog {
  constructor(
    public noteDialogRef: MatDialogRef<NoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: NoteDialogData,
  ) {
  }

  onNoClick(): void {
    this.noteDialogRef.close();
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tags-dialog',
  templateUrl: 'tags-dialog.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class TagsDialog {
  constructor(
    public tagsDialogRef: MatDialogRef<TagsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TagsDialogData,
  ) {
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.data.tagsForEdit.push({name: value});
    }
    event.chipInput!.clear();
  }

  remove(tag: Tag): void {
    const index = this.data.tagsForEdit.indexOf(tag);
    if (index >= 0) {
      this.data.tagsForEdit.splice(index, 1);
    }
  }

  onNoClick(): void {
    this.tagsDialogRef.close();
  }
}
