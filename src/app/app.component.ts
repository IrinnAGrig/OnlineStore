import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
