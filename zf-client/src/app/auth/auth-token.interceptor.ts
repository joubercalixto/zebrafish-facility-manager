import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, lastValueFrom, Observable} from 'rxjs';
import {AuthService} from './auth.service';

/**
 * This just intercepts the outbound http requests and inserts the jwt
 * More efficient than doing it in every single http request.
 *
 * Note that because the configService runs before app initialization,
 * it's HTTP requests are *not* intercepted and do not therefore have
 * a bearer token. This is fully intended.
 *
 */

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    if (this.authService.accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.authService.accessToken,
        }
      });
    } else {
      // TODO Log this.
      // console.log("No token available for url: " + request.url);
    }
    return lastValueFrom(next.handle(request));
  }
}
