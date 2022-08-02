import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, Subject, take, takeUntil} from 'rxjs';
import {LocalStorageService} from "../../services/local-storage.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModelService} from "../../services/model.service";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginValid = true;
  loginForm: FormGroup;
  alert = '';

  constructor(private alertCtrl: AlertController, private router: Router,
              private localStorageService: LocalStorageService, private modelServise: ModelService) {
    this.loginForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    });
  }

  ngOnInit(): void {
    if (this.localStorageService.loggedIn()) {
      this.router.navigateByUrl('');
    }
  }

  onSubmit(): void {
    this.loginValid = true;
    if (this.loginForm.valid) {
      this.modelServise.login(this.loginForm.controls['username'].value, this.loginForm.controls['password'].value)
        .subscribe({
        next: data => {
          if (data.status != 0) {
            this.alert = data.msg;
            this.loginValid = false;
          } else {
            this.localStorageService.setUser(data.meta.attempted_username, data.meta.name, data.meta.email);
            this.router.navigateByUrl('');
          }
        },
        error: _ => {
          this.alert = 'Your network is not stable, please try later.';
          this.loginValid = false;
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
