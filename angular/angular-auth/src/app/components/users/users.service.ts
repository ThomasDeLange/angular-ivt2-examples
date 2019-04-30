import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, retry, catchError } from 'rxjs/operators';
import { User } from './user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: User[]

  usersAvailable = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient
  ) {
    console.log('UserService constructed');
    console.log(`Connected to ${environment.apiUrl}`);
  }

  public getUsers(): Observable<User[]> {
    console.log('getUsers');
    return this.http.get<ApiResponse>(`${environment.apiUrl}/api/persons?offset=0&amount=8`).pipe(
      //   convert incoming responsestring to json
      // map(response => response.json()),
      //   get only the results property
      // map(response => response.results),
      //   optionally log the results
      // tap(console.log),
      //   convert json array to User array
      // map(users => users.map(data => new User(data))),
      //   optionally log the results
      // tap(console.log)

      catchError(this.handleError), // then handle the error
      // tap( // Log the result or error
      //   data => console.log(data),
      //   error => console.error('NU HIER: ' + error)
      // ),
      // all of the above can also be done in one operation:
      map(response => response.results.map(data => new User(data))),
      tap(users => {
          this.users = users;
          this.usersAvailable.next(true);
        })
        // error => console.log(error))
    );
  }
  getUser(id: number): User {
    console.log(`getUser(${id})`);

    if (this.users && id >= 0 && id < this.users.length) {
      // id is valid and users are available
      // this returns a reference to the original array item!
      // https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
      return this.users[id];
    } else {
      return undefined;
    }
  }

  createUser(user: User) {
    console.log('createUser');
    return this.http.post(`${environment.apiUrl}/api/persons`, user)
      .pipe(
        catchError(this.handleError), // then handle the error
        tap( // Log the result or error
          data => console.log(data)
          // ,
          // error => console.error(error)
        )
      );

  }

  updateUser(user: User) {
    console.log('updateUser');
    // ToDo: needs implementation
    return this.http.put(`${environment.apiUrl}/api/persons/${user._id}`, user);
  }

  private handleError(error: HttpErrorResponse) {
    console.log('handleError')
    // if (error.error instanceof ErrorEvent) {
    //   // A client-side or network error occurred. Handle it accordingly.
    //   console.error('An error occurred:', error.error.message);
    // } else {
    //   // The backend returned an unsuccessful response code.
    //   // The response body may contain clues as to what went wrong,
    //   console.error(
    //     `Backend returned code ${error.status}, ` +
    //     `body was: ${error.message}`);
    // }

    // return an observable with a user-facing error message
    return throwError(
      // 'Something bad happened; please try again later.'
      error.message || error.error.message
    );
  };

}

/**
 * This interface specifies the structure of the expected API server response.
 */
export interface ApiResponse {
  results: any[];
}
