import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth/auth.service';
import { UserDetails } from '../shared/services/auth/auth.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user!: UserDetails;
  editImageMode = false;
  previousImage = '';
  constructor(private authService: AuthService) {
    this.authService.userDetails.subscribe(res => {
      this.user = res;
      this.previousImage = res.image;
    });
  }
  convertToBase64(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String: string = reader.result as string;
      this.user.image = base64String;
    };
    if (file)
      reader.readAsDataURL(file);
  }
  saveImage() {
    this.authService.changeImageProfile(this.user).subscribe(() => {
      this.editImageMode = false;
    });
  }
  cancel() {
    this.user.image = this.previousImage;
    this.editImageMode = false;
  }
  logout() {
    this.authService.logout();
    // localStorage.removeItem('chart');
  }
}
