import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, catchError, map, Observable, switchMap, tap, throwError } from "rxjs";
import { LoginData, SignUpData, UserDetails } from "./auth.model";
import { Route, Router } from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userDetails$: BehaviorSubject<UserDetails> =
    new BehaviorSubject<UserDetails>({} as UserDetails);

  url = "http://localhost:3000/users";

  constructor(private http: HttpClient, private router: Router) {
  }
  public get userDetails(): Observable<UserDetails> {
    return this._userDetails$.asObservable();
  }

  signIn(data: LoginData): Observable<UserDetails> {

    return this.http.get<UserDetails>(this.url).pipe(
      map(users => {
        if (Array.isArray(users)) {
          const matchingUser = users.find(user => user.username === data.username && user.password === data.password);
          if (matchingUser) {
            this._userDetails$.next(matchingUser);
            return matchingUser;
          } else {
            return null;
          }
        } else {
          throw new Error('Datele primite de la server nu sunt de tipul așteptat.');
        }
      })
    );
  }
  signUp(data: SignUpData): Observable<UserDetails> {
    let NewData: UserDetails = {
      id: Math.floor(Math.random() * (50 - 22 + 1)) + 22,
      username: data.username,
      fullName: data.fullName,
      image: "",
      password: data.password,
      role: "user"
    }
    return this.http.post<UserDetails>(this.url, NewData).pipe(tap(() => {
      this._userDetails$.next(NewData);
      return NewData;
    }));
  }

  logout() {
    localStorage.removeItem('userDetails');
    this.router.navigate(['/auth']);
    window.location.reload();
  }
  changeImageProfile(user: UserDetails): Observable<boolean> {
    return this.http.put<boolean>(`${this.url}/${user.id}`, user).pipe(tap(() => { this._userDetails$.next(user); }));
  }

  autoLogin() {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);

    }
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      const userData = JSON.parse(storedUserDetails);
      this._userDetails$.next(userData);
    }
  }
}