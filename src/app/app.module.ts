import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {DesktopComponent, NoteDialog, TagsDialog} from './pages/desktop/desktop.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatExpansionModule} from "@angular/material/expansion";
import { CommonModule } from '@angular/common';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {MatNativeDateModule} from '@angular/material/core';
import {MaterialExampleModule} from '../material.module';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { LoginComponent } from './pages/login/login.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import {DatePipe} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DesktopComponent,
    MapViewComponent,
    NoteDialog,
    TagsDialog,
    UploadComponent,
    ProfileComponent,
    ResetPasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatChipsModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatNativeDateModule,
    MaterialExampleModule,
    FormsModule,
	CommonModule,
    GoogleMapsModule,
  ],
  exports:[MapViewComponent],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
