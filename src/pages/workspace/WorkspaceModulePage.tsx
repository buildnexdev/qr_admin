import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getWorkspacePage } from './workspaceMeta';
import './workspace.scss';

const WorkspaceModulePage: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const meta = getWorkspacePage(pageKey);

  if (!pageKey || !meta) {
    return <Navigate to="/admin/workspace" replace />;
  }

  if (meta.appPath) {
    return <Navigate to={meta.appPath} replace />;
  }

  return (
    <div className="workspace-module">
      <span className="workspace-module__badge">{meta.category}</span>
      <h1 className="workspace-module__title">{meta.title}</h1>
      <p className="workspace-module__text">{meta.blurb}</p>
      <p className="workspace-module__text">
        This page is reserved for upcoming functionality. Use the main hub to jump between modules while APIs and UI
        are implemented.
      </p>
      <div className="workspace-module__actions">
        <Link to="/admin/workspace" className="workspace-module__btn">
          <ArrowLeft size={18} aria-hidden />
          All modules
        </Link>
        <Link to="/admin" className="workspace-module__btn workspace-module__btn--primary">
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default WorkspaceModulePage;
