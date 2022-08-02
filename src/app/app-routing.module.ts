import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DesktopComponent} from "./pages/desktop/desktop.component";
import {LoginComponent} from "./pages/login/login.component";
import {UploadComponent} from "./pages/upload/upload.component";
import {MapViewComponent} from "./pages/map-view/map-view.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {ResetPasswordComponent} from "./pages/reset-password/reset-password.component";

const routes: Routes = [
  {path: '', component: DesktopComponent},
  {path: 'login', component: LoginComponent},
  {path: 'resetpassword', component: ResetPasswordComponent},
  {path: 'upload', component: UploadComponent},
  {path: 'mapview/:id', component: MapViewComponent},
  {path: 'profile', component: ProfileComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
