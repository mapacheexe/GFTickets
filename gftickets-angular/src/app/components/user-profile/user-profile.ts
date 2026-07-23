import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { Usuario } from '../../models/usuario.model';
import { USER_SERVICE } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private readonly userService = inject(USER_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = signal<Usuario | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUser();
  }

  protected retry(): void {
    this.loadUser();
  }

  protected initials(displayName: string): string {
    const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
    const firstInitial = nameParts[0]?.charAt(0) ?? '';
    const lastInitial = nameParts.length > 1 ? nameParts.at(-1)?.charAt(0) ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  private loadUser(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se han podido cargar tus datos.');
          this.loading.set(false);
        },
      });
  }
  logout(): void {
    sessionStorage.removeItem('gftickets.firebase-session');
    this.user.set(null);
  }
}
