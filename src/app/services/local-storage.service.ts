import {Injectable} from '@angular/core';
import {LocalStorageRefService} from "./local-storage-ref.service";
import {Photo} from "../types/data";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private _localStorage: Storage;

  constructor(private _localStorageRefService: LocalStorageRefService) {
    this._localStorage = _localStorageRefService.localStorage;
  }

  setUser(username: string, name: string, email: string): boolean {
    try {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      return true;
    } catch (error) {
      return false;
    }
  }

  loggedIn(): boolean {
    var tmp = localStorage.getItem('loggedIn');
    if (tmp && tmp == 'true')
      return true;
    else
      return false;
  }

  getCurrentUserUsername(): string {
    var tmp = localStorage.getItem('username');
    if (tmp)
      return tmp;
    else
      return '';
  }

  getCurrentUserName(): string {
    var tmp = localStorage.getItem('name');
    if (tmp)
      return tmp;
    else
      return '';
  }

  getCurrentUserEmail(): string {
    var tmp = localStorage.getItem('email');
    if (tmp)
      return tmp;
    else
      return '';
  }

  removeCurrentUser(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }

  setPhoto(photo: Photo) {
    try {
      localStorage.setItem('photoId', photo.id);
      localStorage.setItem('photoPath', photo.path);
      localStorage.setItem('photoGps', photo.gps);
      localStorage.setItem('photoDate', photo.date);
      localStorage.setItem('photoResult', photo.result);
      localStorage.setItem('photoNotes', photo.notes);
      localStorage.setItem('photoTags', photo.tags);
      localStorage.setItem('photoUsername', photo.username);
      return true;
    } catch {
      return false;
    }
  }

  getPhoto(): Photo {
    try {
      return {
        id: localStorage.getItem('photoId')!,
        path: localStorage.getItem('photoPath')!,
        gps: localStorage.getItem('photoGps')!,
        date: localStorage.getItem('photoDate')!,
        result: localStorage.getItem('photoResult')!,
        notes: localStorage.getItem('photoNotes')!,
        tags: localStorage.getItem('photoTags')!,
        username: localStorage.getItem('photoUsername')!,
      };
    } catch {
      return {
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
  }
}
