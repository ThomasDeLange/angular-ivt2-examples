import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../users/user.model';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { AlertService } from 'src/app/modules/alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInUser = new BehaviorSubject<boolean>(false);
  private isAdminUser = new BehaviorSubject<boolean>(false);
  private isPlainUser = new BehaviorSubject<boolean>(false);
  // Username for printing in navbar
  private loggedInEmail = new BehaviorSubject<string>('');
  private loggedInFullName = new BehaviorSubject<string>('');

  private readonly currentUser = 'currentuser';
  private readonly currentToken = 'token';

  // store the URL so we can redirect after logging in
  public readonly redirectUrl: string = '/dashboard';

  private readonly headers = new Headers({ 'Content-Type': 'application/json' });

  /**
   *
   * @param alertService
   * @param router
   * @param http
   */
  constructor(
    private alertService: AlertService,
    private router: Router,
    private http: Http
  ) {
    this.getCurrentUser().subscribe({
      next: (user: User) => {
        console.log(`${user.email} logged in`);
        this.isLoggedInUser.next(true);
        this.loggedInEmail.next(user.email);
        this.loggedInFullName.next(user.firstName + ' ' + user.lastName);

        // Verify the possible roles the user can have.
        // Add more verifications when nessecary.
        user.hasRole(UserRole.Admin).subscribe(result => this.isAdminUser.next(result));
        user.hasRole(UserRole.Basic).subscribe(result => this.isPlainUser.next(result));
      },
      error: message => {
        this.isLoggedInUser.next(false);
        this.isAdminUser.next(false);
        this.isPlainUser.next(false);
        // this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Log in
   *
   * @param username
   * @param password
   */
  login(email: string, password: string) {
    console.log('login');
    console.log(`${environment.apiUrl}/login`)

    return this.http.post(`${environment.apiUrl}/login`, { email: email, password: password }, { headers: this.headers })
      .pipe(
        map(response => response.json()),
        tap(console.log)
      ).subscribe({
        next: response => {
          const currentUser = new User({firstName: response.firstName, lastName: response.lastName, email: email});
          console.dir(currentUser);
          this.saveCurrentUser(currentUser, response.token);

          // Notify all listeners that we're logged in.
          this.isLoggedInUser.next(true);
          this.loggedInEmail.next(currentUser.email);
          currentUser.hasRole(UserRole.Admin).subscribe(result => this.isAdminUser.next(result));
          currentUser.hasRole(UserRole.Basic).subscribe(result => this.isPlainUser.next(result));

          this.alertService.success('U bent ingelogd');
          //
          // If redirectUrl exists, go there
          // this.router.navigate([this.redirectUrl]);
          // return true;
        },
        error: err => {
          console.error('Error logging in: ' + err);
          this.alertService.error('Invalid credentials');
        }
      });
  }

  register(email: string, password: string, firstName: String, lastName: String) {
    console.log('register');
    console.log(`${environment.apiUrl}/register`);

    return this.http.post(`${environment.apiUrl}/register`, { email: email, password: password, firstName: firstName, lastName: lastName },
    { headers: this.headers })
      .pipe(
        map(response => response.json()),
        tap(console.log)
      ).subscribe({
        next: response => {
          const currentUser = new User({firstName: response.firstName, lastName: response.lastName, email: email});
          console.dir(currentUser);
          this.saveCurrentUser(currentUser, response.token);

          // Notify all listeners that we're logged in.
          this.isLoggedInUser.next(true);
          this.loggedInEmail.next(currentUser.email);
          currentUser.hasRole(UserRole.Admin).subscribe(result => this.isAdminUser.next(result));
          currentUser.hasRole(UserRole.Basic).subscribe(result => this.isPlainUser.next(result));

          this.alertService.success('U bent geregistreerd en ingelogd');
          //
          // If redirectUrl exists, go there
          // this.router.navigate([this.redirectUrl]);
          // return true;
        },
        error: err => {
          console.error('Error logging in: ' + err);
          this.alertService.error('Error logging in: ' + err);
        }
      });
  }

  /**
   * Log out.
   */
  logout() {
    console.log('logout');
    localStorage.removeItem(this.currentUser);
    localStorage.removeItem(this.currentToken);
    this.isLoggedInUser.next(false);
    this.isAdminUser.next(false);
    this.alertService.success('U bent uitgelogd');
  }

  /**
   * Get the currently logged in user.
   */
  private getCurrentUser(): Observable<User> {
    return Observable.create(observer => {
      const localUser: any = JSON.parse(localStorage.getItem(this.currentUser));
      if (localUser) {
        console.log('localUser found');
        observer.next(new User(localUser));
        observer.complete();
      } else {
        console.log('NO localUser found');
        observer.error('NO localUser found');
        observer.complete();
      }
    });
  }

  /**
   *
   */
  private saveCurrentUser(user: User, token: string): void {
    localStorage.setItem(this.currentUser, JSON.stringify(user));
    localStorage.setItem(this.currentToken, token)
  }

  get userFullName(): Observable<string> {
    console.log('user Full Name ' + this.loggedInFullName.value);
    return this.loggedInFullName.asObservable();
  }

  /**
   *
   */
  get userIsLoggedIn(): Observable<boolean> {
    console.log('userIsLoggedIn() ' + this.isLoggedInUser.value);
    return this.isLoggedInUser.asObservable();
  }

  /**
   *
   */
  get userIsAdmin(): Observable<boolean> {
    console.log('userIsAdmin() ' + this.isAdminUser.value);
    return this.isAdminUser.asObservable();
  }

  /**
   *
   */
  get userIsPlain(): Observable<boolean> {
    console.log('userIsPlain() ' + this.isPlainUser.value);
    return this.isPlainUser.asObservable();
  }

}
