import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseUserService } from '../../services/firebase-user.service';

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

  loading = false;
  errorMessage = '';

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

    this.loading = true;
    this.errorMessage = '';

    this.firebaseUserService
      .loginUser({
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!
      })
      .subscribe({

        next: (response) => {
          this.loading = false;

          console.log('Usuario autenticado:', response);

          localStorage.setItem(
            'token',
            response.idToken
          );

          this.router.navigate(['/']);
        },

        error: (error) => {
          this.loading = false;

          this.errorMessage =
            error.error?.error?.message ??
            'Error al iniciar sesión';
        }

      });
  }

}