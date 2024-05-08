import {
    ActivatedRouteSnapshot,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(private authService: AuthService, private router: Router) { }
    canActivateChild(
        route: ActivatedRouteSnapshot,
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return this.authService.userDetails.pipe(
            take(1),
            map(user => {
                let roles: string[] = route.data['role'];
                let redirect = true;
                roles.forEach(role => {
                    if (user.role == 'user' && role == user.role || user.role == 'admin' && role == user.role) {
                        redirect = false;
                    }
                    if (role == "Any") {
                        redirect = false;
                    }
                })

                if (redirect) {
                    this.router.navigate(['/auth']);
                }
                return true;
            })
        );
    }
}