import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.userIsLoggedIn.subscribe(alreadyLoggedIn => {
      if(alreadyLoggedIn) {
        console.log('User already logged in > to dashboard');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, this.validEmail.bind(this)]),
      'password': new FormControl(null, [Validators.required, this.validPassword.bind(this)]),
    });
  }

  onSubmit() {
    if(this.loginForm.valid){
      const email = this.loginForm.value['email'];
      const password = this.loginForm.value['password'];
      this.authService.login(email, password);
    } else {
      console.error('loginForm invalid');
    }
  }

  validEmail(control: FormControl): {[s: string]: boolean} {
    const email = control.value;
    const regexp = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$');
    if (regexp.test(email) !== true) {
      return {email: false};
    } else {
      return null;
    }
  }

  validPassword(control: FormControl): {[s: string]: boolean} {
    const password = control.value;
    const regexp = new RegExp('^[a-zA-Z]([a-zA-Z0-9]){2,14}');
    const test = regexp.test(password);
    if (regexp.test(password) !== true) {
      return {password: false};
    } else {
      return null;
    }
  }
}
