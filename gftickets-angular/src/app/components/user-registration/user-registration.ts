import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { USER_SERVICE } from '../../services/user.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string | undefined;
  const passwordConfirmation = control.get('passwordConfirmation')?.value as string | undefined;
  return password === passwordConfirmation ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-user-registration',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-registration.html',
  styleUrl: './user-registration.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationComponent {
  private readonly userService = inject(USER_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly form = new FormGroup(
    {
      displayName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(160)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email, Validators.maxLength(120)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6), Validators.maxLength(72)],
      }),
      passwordConfirmation: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatch },
  );

  protected submit(): void {
    if (this.submitting()) {
      return;
    }

    this.error.set(null);
    this.success.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const registro = {
      displayName: values.displayName,
      email: values.email,
      password: values.password,
    };
    this.submitting.set(true);

    this.userService
      .registerUser(registro)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.success.set(true);
          this.form.reset();
        },
        error: (error: unknown) => {
          this.error.set(
            error instanceof Error
              ? error.message
              : 'No se ha podido crear la cuenta. Inténtalo de nuevo.',
          );
        },
      });
  }
}
