import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, take} from 'rxjs/operators';
import {Globals} from '../global';
import {Photo, Response, User} from '../types/data';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  options = {
    headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
    withCredentials: true,
  };

  binaryOptions = {
    headers: new HttpHeaders().set('Content-Type', 'multipart/form-data'),
    withCredentials: true,
  };

  clearOptions = {
    headers: new HttpHeaders().delete('Content-Type'),
    withCredentials: true,
  };

  //x-www-form-urlencoded with URLSearchParams()
  //multipart/form-data with FormData()

  constructor(private http: HttpClient, public global: Globals,
              private LocalStorage: LocalStorageService) {
  }

  login(username: string, password: string): Observable<Response> {
    let body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    return this.http.post<Response>(this.global.domain + '/adminlogin', body.toString(), this.options);
  }

  logout() {
    return this.http.get<Response>(this.global.domain + '/logout', this.options);
  }

  register(username: string, password: string, email: string, name: string): Observable<Response> {
    let body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    body.set('email', email);
    body.set('name', name);
    return this.http.post<Response>(this.global.domain + '/register', body.toString(), this.options);
  }

  changePassword(username: string, password: string, email: string): Observable<Response> {
    let body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    body.set('email', email);
    return this.http.post<Response>(this.global.domain + '/resetpassword', body.toString(), this.options);
  }

  upload(gps: string, notes: string, photo: File): Observable<any> {
    if (notes == null)
      notes = '';
    const formData = new FormData();
    formData.append('gps', gps);
    formData.append("photo", photo);
    formData.append('notes', notes);
    // return this.http.post<Response>(this.global.domain + '/photoupload', formData, this.clearOptions);
    return this.http.post(this.global.domain + '/photoupload', formData, {
      reportProgress: true,
      observe: 'events',
      headers: new HttpHeaders().delete('Content-Type'),
      withCredentials: true,
    }).pipe(catchError(this.errorMgmt));
  }

  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }

  updatePhotoInfo(photoId: string, notes: string, tags: string): Observable<Response> {
    let formData = new URLSearchParams();
    formData.append('photo_id', photoId);
    formData.append("notes", notes);
    formData.append('tags', tags);
    return this.http.post<Response>(this.global.domain + '/adminupdatephotoinfo', formData, this.options);
  }

  getPhoto(id: string): Observable<Response> {
    let formData = new URLSearchParams();
    formData.append('id', id);
    return this.http.post<Response>(this.global.domain + '/adminphotobyid', formData, this.options);
  }

  getPhotoList(mindate: string, maxdate: string, page: string): Observable<Response> {
    let formData = new URLSearchParams();
    formData.append('mindate', mindate);
    formData.append("maxdate", maxdate);
    formData.append('page', page);
    return this.http.post<Response>(this.global.domain + '/adminphotolist', formData, this.options);
  }

  searchFilterTag(taglist: string): Observable<Response> {
    let formData = new URLSearchParams();
    formData.append('taglist', taglist);
    return this.http.post<Response>(this.global.domain + '/searchfiltertag', formData, this.options);
  }

  searchFilterNote(querystring: string, page: string): Observable<Response> {
    let formData = new URLSearchParams();
    formData.append('querystring', querystring);
    formData.append('page', page);
    return this.http.post<Response>(this.global.domain + '/searchfilterglobal', formData, this.options);
  }

  searchFilterGeo(gps: string, radius: string, radiusunit: string, last_token: string,
                  next_token: string): Observable<Response> {
    let formData = new URLSearchParams();
    formData.append('gps', gps);
    formData.append('radius', radius);
    formData.append('radiusunit', radiusunit);
    formData.append('last_token', last_token);
    formData.append('next_token', next_token);
    return this.http.post<Response>(this.global.domain + '/searchfiltergeography', formData, this.options);
  }
}
