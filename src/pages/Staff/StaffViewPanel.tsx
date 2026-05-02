import React, { useMemo } from 'react';
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  BarChart3,
  CalendarClock,
} from 'lucide-react';
import type { StaffMember } from '../../store/staffSlice';

function fmtDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d;
  }
}

interface Props {
  staff: StaffMember | null;
  loading?: boolean;
}

const StaffViewPanel: React.FC<Props> = ({ staff, loading }) => {
  if (loading) {
    return (
      <div className="staff-view-panel text-muted py-4 text-center">
        Loading staff profile…
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="staff-view-panel text-muted py-4 text-center">
        No staff selected.
      </div>
    );
  }

  const docFields = useMemo(() => {
    try {
      const j = staff.documentsJson ? JSON.parse(staff.documentsJson) : {};
      return {
        aadhar: j.aadharNumber || '',
        pan: j.panNumber || '',
        addressProof: j.addressProofNumber || '',
      };
    } catch {
      return { aadhar: '', pan: '', addressProof: '' };
    }
  }, [staff.documentsJson]);

  const roleLower = (staff.role || '').toLowerCase();
  const perfHint =
    roleLower.includes('server') || roleLower.includes('waiter')
      ? 'Orders handled'
      : roleLower.includes('cashier') || roleLower.includes('bill')
        ? 'Bills processed'
        : roleLower.includes('deliver')
          ? 'Deliveries completed'
          : 'Performance';

  return (
    <div className="staff-view-panel d-flex flex-column gap-4">
      <div className="d-flex align-items-start gap-3">
        <img
          src={staff.image || `https://i.pravatar.cc/150?u=${staff.id}`}
          alt=""
          className="staff-profile-pill"
          style={{ width: 72, height: 72, flexShrink: 0 }}
        />
        <div className="min-w-0">
          <h3 className="h5 mb-1 text-truncate">{staff.name}</h3>
          <div className="text-muted small">
            {staff.employeeId ? (
              <span className="me-2">ID: {staff.employeeId}</span>
            ) : null}
            <span
              className={`badge ${staff.status ? 'text-bg-success' : 'text-bg-secondary'}`}
            >
              {staff.status ? 'Active' : 'Inactive'}
            </span>
            {staff.isPublish === false ? (
              <span className="badge text-bg-warning ms-1">Unpublished</span>
            ) : null}
          </div>
        </div>
      </div>

      <section>
        <h4 className="staff-view-section-title">
          <User size={16} /> Personal
        </h4>
        <dl className="staff-view-dl">
          <div>
            <dt>Gender</dt>
            <dd>{staff.gender || '—'}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>{fmtDate(staff.dateOfBirth)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h4 className="staff-view-section-title">
          <Phone size={16} /> Contact
        </h4>
        <dl className="staff-view-dl">
          <div>
            <dt>Mobile</dt>
            <dd>{staff.phone || '—'}</dd>
          </div>
          <div>
            <dt>Alternate</dt>
            <dd>{staff.alternatePhone || '—'}</dd>
          </div>
          <div>
            <dt>
              <Mail size={14} className="me-1 opacity-75" />
              Email
            </dt>
            <dd>{staff.email || '—'}</dd>
          </div>
          <div>
            <dt>
              <MapPin size={14} className="me-1 opacity-75" />
              Address
            </dt>
            <dd className="text-wrap">{staff.address || '—'}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h4 className="staff-view-section-title">
          <Building2 size={16} /> Work
        </h4>
        <dl className="staff-view-dl">
          <div>
            <dt>Role</dt>
            <dd>
              <span className="staff-role-badge">{staff.role}</span>
            </dd>
          </div>
          <div>
            <dt>Branch</dt>
            <dd>{staff.branch || '—'}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{staff.department || '—'}</dd>
          </div>
          <div>
            <dt>
              <Calendar size={14} className="me-1 opacity-75" />
              Joining date
            </dt>
            <dd>{fmtDate(staff.joiningDate)}</dd>
          </div>
          <div>
            <dt>
              <Clock size={14} className="me-1 opacity-75" />
              Shift
            </dt>
            <dd>{staff.shiftTiming || '—'}</dd>
          </div>
          <div>
            <dt>Username</dt>
            <dd>{staff.username || '—'}</dd>
          </div>
        </dl>
      </section>

      {(docFields.aadhar || docFields.pan || docFields.addressProof) ? (
        <section>
          <h4 className="staff-view-section-title">
            <CreditCard size={16} /> ID numbers
          </h4>
          <dl className="staff-view-dl">
            {docFields.aadhar ? (
              <div>
                <dt>Aadhar</dt>
                <dd>{docFields.aadhar}</dd>
              </div>
            ) : null}
            {docFields.pan ? (
              <div>
                <dt>PAN</dt>
                <dd>{docFields.pan}</dd>
              </div>
            ) : null}
            {docFields.addressProof ? (
              <div>
                <dt>Address proof no.</dt>
                <dd>{docFields.addressProof}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <section className="staff-view-placeholder-section">
        <h4 className="staff-view-section-title">
          <BarChart3 size={16} /> Performance
        </h4>
        <p className="text-muted small mb-2">
          {perfHint}: activity metrics will appear here when linked to orders and billing.
        </p>
        <div className="staff-view-kpi-row">
          <div className="staff-view-kpi">
            <span className="staff-view-kpi-val">—</span>
            <span className="staff-view-kpi-lbl">{perfHint}</span>
          </div>
        </div>
      </section>

      <section className="staff-view-placeholder-section">
        <h4 className="staff-view-section-title">
          <CalendarClock size={16} /> Attendance
        </h4>
        <p className="text-muted small mb-2">
          Optional module: check-in/out, daily list, and late tracking can be enabled later.
        </p>
        <dl className="staff-view-dl mb-0">
          <div>
            <dt>Today</dt>
            <dd>—</dd>
          </div>
          <div>
            <dt>Login / Logout</dt>
            <dd>—</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};

export default StaffViewPanel;
