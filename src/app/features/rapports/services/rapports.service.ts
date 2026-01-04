import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '@services/api.service';
@Injectable({ providedIn: 'root' })
export class RapportsService {
  private readonly api = inject(ApiService);
}
