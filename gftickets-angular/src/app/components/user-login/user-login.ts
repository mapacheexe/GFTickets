import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseUserService } from '../../services/firebase-user.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {

  private readonly fb = inject(FormBuilder);
  private readonly firebaseUserService = inject(FirebaseUserService);
  private readonly router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ]
  });

  login(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.firebaseUserService
      .loginUser({
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!
      })
      .pipe(
        timeout(10000)
      )
      .subscribe({

        next: () => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },

        error: (error: unknown) => {
          console.error('Error al iniciar sesión:', error);
          this.loading.set(false);

          this.errorMessage.set(error instanceof Error ? error.message : 'Error al iniciar sesión');
        }

      });

  }

}
