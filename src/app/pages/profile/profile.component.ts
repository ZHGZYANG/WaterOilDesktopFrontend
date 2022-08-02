import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage.service";
import {ModelService} from "../../services/model.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  username: string = '';
  name: string = '';
  email: string = '';

  constructor(private localStorageService: LocalStorageService, private modelServise: ModelService,
              private router: Router,) {
  }

  ngOnInit() {
    if (!this.localStorageService.loggedIn()) {
      this.router.navigateByUrl('login');
      return;
    }
    this.email = this.localStorageService.getCurrentUserEmail();
    this.username = this.localStorageService.getCurrentUserUsername();
    this.name = this.localStorageService.getCurrentUserName();
  }

  resetPassword() {
    this.router.navigateByUrl('resetpassword');
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
}
