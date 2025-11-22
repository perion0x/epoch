'use client';

import { useState } from 'react';
import { Newsletter } from '@/types';
import { ContentSection } from '@/services/content';

/**
 * Issue Publishing Form Component
 * Implements Requirements 2.1, 2.2
 * 
 * Features:
 * - Rich text editor for content
 * - Section markers for public/premium content
 * - Content preview
 * - Publishing progress tracking
 */

interface IssuePublishingFormProps {
  newsletter: Newsletter;
  onPublish: (title: string, sections: ContentSection[]) => Promise<void>;
}

type PublishingStatus = 'idle' | 'encrypting' | 'uploading' | 'confirming' | 'success' | 'error';

interface ContentSectionInput {
  id: string;
  type: 'public' | 'premium';
  content: string;
  format: 'markdown' | 'html' | 'plain';
}

export function IssuePublishingForm({ newsletter, onPublish }: IssuePublishingFormProps) {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<ContentSectionInput[]>([
    { id: '1', type: 'public', content: '', format: 'markdown' },
  ]);
  const [publishingStatus, setPublishingStatus] = useState<PublishingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Add a new section
  const addSection = (type: 'public' | 'premium') => {
    const newSection: ContentSectionInput = {
      id: Date.now().toString(),
      type,
      content: '',
      format: 'markdown',
    };
    setSections([...sections, newSection]);
  };

  // Remove a section
  const removeSection = (id: string) => {
    if (sections.length === 1) {
      setError('Issue must have at least one section');
      return;
    }
    setSections(sections.filter((s) => s.id !== id));
  };

  // Update section content
  const updateSection = (id: string, content: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, content } : s))
    );
  };

  // Update section type
  const updateSectionType = (id: string, type: 'public' | 'premium') => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, type } : s))
    );
  };

  // Update section format
  const updateSectionFormat = (id: string, format: 'markdown' | 'html' | 'plain') => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, format } : s))
    );
  };

  // Move section up
  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSections(newSections);
  };

  // Move section down
  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSections(newSections);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Issue title is required');
      return false;
    }

    if (sections.length === 0) {
      setError('Issue must have at least one section');
      return false;
    }

    const hasContent = sections.some((s) => s.content.trim().length > 0);
    if (!hasContent) {
      setError('Issue must have at least one section with content');
      return false;
    }

    return true;
  };

  // Handle publish
  const handlePublish = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Convert sections to ContentSection format
      const contentSections: ContentSection[] = sections
        .filter((s) => s.content.trim().length > 0)
        .map((s) => ({
          type: s.type,
          content: s.content,
          format: s.format,
        }));

      // Show publishing progress
      setPublishingStatus('encrypting');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate encryption

      setPublishingStatus('uploading');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate upload

      setPublishingStatus('confirming');
      
      // Call the publish function
      await onPublish(title, contentSections);

      setPublishingStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setTitle('');
        setSections([{ id: Date.now().toString(), type: 'public', content: '', format: 'markdown' }]);
        setPublishingStatus('idle');
      }, 2000);
    } catch (err) {
      setPublishingStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to publish issue');
    }
  };

  // Get status message
  const getStatusMessage = () => {
    switch (publishingStatus) {
      case 'encrypting':
        return 'Encrypting premium content...';
      case 'uploading':
        return 'Uploading to Walrus...';
      case 'confirming':
        return 'Confirming transaction...';
      case 'success':
        return 'Issue published successfully!';
      case 'error':
        return 'Failed to publish issue';
      default:
        return '';
    }
  };

  const isPublishing = ['encrypting', 'uploading', 'confirming'].includes(publishingStatus);
  const hasPremiumSections = sections.some((s) => s.type === 'premium');

  return (
    <div className="issue-publishing-form">
      <div className="form-header">
        <h2>Publish New Issue</h2>
        <p className="form-subtitle">
          Publishing to: <strong>{newsletter.title}</strong>
        </p>
      </div>

      {/* Title Input */}
      <div className="form-group">
        <label htmlFor="issue-title" className="form-label">
          Issue Title *
        </label>
        <input
          id="issue-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter issue title..."
          className="form-input"
          disabled={isPublishing}
        />
      </div>

      {/* Content Sections */}
      <div className="form-group">
        <div className="sections-header">
          <label className="form-label">Content Sections</label>
          <div className="section-actions">
            <button
              type="button"
              onClick={() => addSection('public')}
              className="add-section-button public"
              disabled={isPublishing}
            >
              + Public Section
            </button>
            <button
              type="button"
              onClick={() => addSection('premium')}
              className="add-section-button premium"
              disabled={isPublishing}
            >
              + Premium Section
            </button>
          </div>
        </div>

        <div className="sections-list">
          {sections.map((section, index) => (
            <div key={section.id} className={`section-editor section-${section.type}`}>
              <div className="section-header">
                <div className="section-info">
                  <span className="section-number">Section {index + 1}</span>
                  <select
                    value={section.type}
                    onChange={(e) =>
                      updateSectionType(section.id, e.target.value as 'public' | 'premium')
                    }
                    className="section-type-select"
                    disabled={isPublishing}
                  >
                    <option value="public">🌐 Public</option>
                    <option value="premium">⭐ Premium</option>
                  </select>
                  <select
                    value={section.format}
                    onChange={(e) =>
                      updateSectionFormat(
                        section.id,
                        e.target.value as 'markdown' | 'html' | 'plain'
                      )
                    }
                    className="section-format-select"
                    disabled={isPublishing}
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="plain">Plain Text</option>
                  </select>
                </div>
                <div className="section-controls">
                  <button
                    type="button"
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0 || isPublishing}
                    className="section-control-button"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSectionDown(index)}
                    disabled={index === sections.length - 1 || isPublishing}
                    className="section-control-button"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    disabled={sections.length === 1 || isPublishing}
                    className="section-control-button remove"
                    title="Remove section"
                  >
                    ×
                  </button>
                </div>
              </div>
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, e.target.value)}
                placeholder={`Enter ${section.type} content here...`}
                className="section-textarea"
                rows={8}
                disabled={isPublishing}
              />
              {section.type === 'premium' && (
                <div className="section-note">
                  <span className="note-icon">🔒</span>
                  This section will be encrypted and only accessible to NFT holders
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Toggle */}
      <div className="form-group">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="preview-toggle-button"
          disabled={isPublishing}
        >
          {showPreview ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="content-preview">
          <h3 className="preview-title">Preview</h3>
          <div className="preview-content">
            <h2 className="preview-issue-title">{title || 'Untitled Issue'}</h2>
            {sections.map((section, index) => (
              <div key={section.id} className={`preview-section preview-${section.type}`}>
                <div className="preview-section-header">
                  <span className="preview-section-label">
                    {section.type === 'public' ? '🌐 Public' : '⭐ Premium'}
                  </span>
                  <span className="preview-section-format">{section.format}</span>
                </div>
                <div className="preview-section-content">
                  {section.content || <em>No content</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publishing Status */}
      {publishingStatus !== 'idle' && (
        <div className={`publishing-status status-${publishingStatus}`}>
          <div className="status-content">
            {isPublishing && <div className="status-spinner" />}
            {publishingStatus === 'success' && <span className="status-icon">✓</span>}
            {publishingStatus === 'error' && <span className="status-icon">✗</span>}
            <span className="status-message">{getStatusMessage()}</span>
          </div>
          {isPublishing && (
            <div className="status-progress">
              <div
                className="status-progress-bar"
                style={{
                  width:
                    publishingStatus === 'encrypting'
                      ? '33%'
                      : publishingStatus === 'uploading'
                      ? '66%'
                      : '100%',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="form-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Info Messages */}
      {hasPremiumSections && !newsletter.accessModel.isFree && (
        <div className="form-info">
          <span className="info-icon">ℹ️</span>
          Premium sections will be encrypted before storage. Only NFT holders will be able to
          decrypt and read them.
        </div>
      )}

      {/* Publish Button */}
      <div className="form-actions">
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing || publishingStatus === 'success'}
          className="publish-button"
        >
          {isPublishing ? 'Publishing...' : 'Publish Issue'}
        </button>
      </div>
    </div>
  );
}
