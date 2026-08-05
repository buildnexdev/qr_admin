import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { workspacePagesByCategory } from './workspaceMeta';
import './workspace.scss';

const WorkspaceHub: React.FC = () => {
  const grouped = workspacePagesByCategory();
  const sectionOrder = [
    'Operations & logistics',
    'Billing & documents',
    'Compliance',
    'Reports',
    'Subscriptions',
  ] as const;

  return (
    <div className="workspace-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Layers size={28} strokeWidth={2} aria-hidden style={{ color: '#2563eb' }} />
        <h1 className="workspace-page__title" style={{ margin: 0 }}>
          Modules &amp; reports
        </h1>
      </div>
      <p className="workspace-page__lead">
        Quick access to delivery, procurement, billing extensions, compliance, detailed reports, and subscriptions.
        Each tile opens a dedicated area — screens are placeholders until backend features are wired.
      </p>

      <div className="workspace-hub__grid">
        {sectionOrder.map((cat) => {
          const pages = grouped[cat];
          if (!pages?.length) return null;
          return (
            <section key={cat}>
              <h2 className="workspace-hub__section-title">{cat}</h2>
              <div className="workspace-hub__cards">
                {pages.map((p) => (
                  <Link key={p.key} to={p.appPath ?? `/admin/workspace/${p.key}`} className="workspace-card">
                    <h3 className="workspace-card__title">{p.title}</h3>
                    <p className="workspace-card__blurb">{p.blurb}</p>
                    <span className="workspace-card__cta">Open module →</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceHub;
