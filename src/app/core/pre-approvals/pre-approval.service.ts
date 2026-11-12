import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type PreApprovalType = 'GUEST' | 'VEHICLE' | 'VISITING_HELP';
export type PreApprovalStatus = 'ACTIVE' | 'CANCELLED';

export type PreApproval = {
  id: number;
  type: PreApprovalType;
  visitDate: string;
  approxEntryTime: string;
  name: string;
  mobileNumber?: string | null;
  vehicleLast4?: string | null;
  status: PreApprovalStatus;
  creatorName?: string | null;
  creatorWing?: string | null;
  creatorFlatNumber?: string | null;
  mine?: boolean;
  createdAt: string;
};

export type PreApprovalPayload = {
  type: PreApprovalType;
  visitDate: string;
  approxEntryTime: string;
  name: string;
  mobileNumber?: string;
  vehicleLast4?: string;
};

@Injectable({ providedIn: 'root' })
export class PreApprovalService {
  private readonly http = inject(HttpClient);

  create(payload: PreApprovalPayload) {
    return this.http.post<PreApproval>(`${environment.apiUrl}/pre-approvals`, payload);
  }

  update(id: number, payload: PreApprovalPayload) {
    return this.http.put<PreApproval>(`${environment.apiUrl}/pre-approvals/${id}`, payload);
  }

  cancel(id: number) {
    return this.http.post<{ message?: string }>(
      `${environment.apiUrl}/pre-approvals/${id}/cancel`,
      {},
    );
  }

  getOne(id: number) {
    return this.http.get<PreApproval>(`${environment.apiUrl}/pre-approvals/${id}`);
  }

  listMine(day: 'today' | 'yesterday') {
    return this.http.get<PreApproval[]>(`${environment.apiUrl}/pre-approvals`, {
      params: { day },
    });
  }

  listGate(day: 'today' | 'yesterday') {
    return this.http.get<PreApproval[]>(`${environment.apiUrl}/pre-approvals/gate`, {
      params: { day },
    });
  }
}
