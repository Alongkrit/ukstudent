'use client';

import React, { useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import {
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Paperclip,
  Trash2,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { apiFetch } from '../../lib/api';

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialService = searchParams?.get('service') || 'Assignment Help';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  const [formData, setFormData] = useState({
    serviceName: initialService,
    subject: '',
    title: '',
    description: '',
    deadlineDate: '',
    deadlineTime: '23:59',
  });

  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadServices() {
      try {
        const res = await apiFetch('/services');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setServices(list);
          const match = list.find((s: any) => s.name === initialService) || list[0];
          if (match) {
            setSelectedServiceId(match.id);
            setFormData((prev) => ({ ...prev, serviceName: match.name }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    }
    loadServices();
  }, [initialService]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new FormData();
      data.append('file', file);

      try {
        const res = await apiFetch('/uploads', {
          method: 'POST',
          body: data,
        });

        if (res.ok) {
          const uploaded = await res.json();
          setAttachments((prev) => [
            ...prev,
            {
              id: uploaded.storageKey || Date.now().toString(),
              fileName: uploaded.fileName || file.name,
              fileUrl: uploaded.fileUrl,
              storageKey: uploaded.storageKey,
              mimeType: uploaded.mimeType,
              sizeBytes: uploaded.sizeBytes || file.size,
              formattedSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            },
          ]);
        } else {
          const errData = await res.json().catch(() => ({ message: 'Upload failed' }));
          setError(errData.message || `Failed to upload ${file.name}`);
        }
      } catch (err: any) {
        setError(err.message || `Network error uploading ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id && a.storageKey !== id));
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const deadlineAt = new Date(`${formData.deadlineDate}T${formData.deadlineTime}:00`).toISOString();
      const payload = {
        serviceId: selectedServiceId || (services[0]?.id || ''),
        subject: formData.subject,
        title: formData.title,
        description: formData.description,
        deadlineAt,
        attachments: attachments.map((a) => ({
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          storageKey: a.storageKey,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
        })),
      };

      const res = await apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/requests/${created.id}`);
      } else {
        const errData = await res.json().catch(() => ({ message: 'Failed to create request' }));
        setError(errData.message || 'Submission failed. Please check form fields.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-12">
      
      {/* Header & Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-primary-navy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <span className="text-xs font-bold text-primary-navy">Step {step} of 3</span>
        </div>

        <h1 className="text-2xl font-extrabold text-primary-navy">Create New Academic Request</h1>

        {/* Stepper indicator */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-2 rounded-full transition-all ${step >= 1 ? 'bg-primary-navy' : 'bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all ${step >= 2 ? 'bg-primary-navy' : 'bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all ${step >= 3 ? 'bg-primary-navy' : 'bg-slate-200'}`} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Request Details */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-primary-navy" />
            Step 1: Request Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Category</label>
              <select
                value={formData.serviceName}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, serviceName: val });
                  const match = services.find((s: any) => s.name === val);
                  if (match) setSelectedServiceId(match.id);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              >
                <option value="Assignment Help">Assignment Help</option>
                <option value="Homework Support">Homework Support</option>
                <option value="Dissertation Guidance">Dissertation Guidance</option>
                <option value="Exam Preparation">Exam Preparation</option>
                <option value="Proofreading & Editing">Proofreading & Editing</option>
                <option value="Programming Help">Programming Help</option>
                <option value="Essay Writing">Essay Writing</option>
                <option value="Referencing Support">Referencing Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science, Law, Economics"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Request Title</label>
            <input
              type="text"
              required
              placeholder="Short title describing your topic or coursework brief"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              placeholder="Describe your requirements, assessment goals, and specific areas where you need guidance..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
              <input
                type="date"
                required
                value={formData.deadlineDate}
                onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Time</label>
              <input
                type="time"
                required
                value={formData.deadlineTime}
                onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Attachments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Real File Attachments */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-4 h-4 text-primary-navy" />
            Step 2: Upload Assignment Brief & Supporting Files
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.py,.js,.ts,.cpp,.java"
          />

          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <Paperclip className="w-8 h-8 text-primary-blue mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-800">Upload your coursework briefs or guidelines</p>
              <p className="text-[11px] text-slate-500">Supports PDF, DOCX, Code (.py, .js, .cpp), Images up to 25MB</p>
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-primary-navy border border-slate-200 text-xs font-bold text-white shadow-sm hover:bg-primary-blue flex items-center justify-center gap-2 mx-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent-gold" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-accent-gold" />
                  <span>+ Select File Attachment</span>
                </>
              )}
            </button>
          </div>

          {/* Attachments List */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Attached Documents ({attachments.length})</label>
            {attachments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No files attached yet. (Optional)</p>
            ) : (
              attachments.map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-primary-navy shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{att.fileName}</span>
                    {att.formattedSize && <span className="text-[10px] text-slate-400 shrink-0">({att.formattedSize})</span>}
                  </div>
                  <button onClick={() => removeAttachment(att.id)} className="p-1 text-slate-400 hover:text-red-600 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <span>Review & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Step 3: Review & Confirm Request
          </h2>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Service Category</span>
              <span className="font-bold text-primary-navy">{formData.serviceName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Subject</span>
              <span className="font-bold text-slate-800">{formData.subject}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Title</span>
              <span className="font-bold text-slate-900">{formData.title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-semibold">Deadline</span>
              <span className="font-bold text-amber-600">{formData.deadlineDate} at {formData.deadlineTime}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Attached Files ({attachments.length})</span>
              {attachments.length === 0 ? (
                <span className="text-slate-400 italic">None</span>
              ) : (
                <ul className="list-disc list-inside text-slate-700">
                  {attachments.map((a) => (
                    <li key={a.id}>{a.fileName}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-accent-gold" />
              <span>Broadcast Matching Trigger</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Upon submission, eligible verified academic experts in {formData.subject} will be immediately notified. The first available expert to accept will open live chat.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-2/3 py-3 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Broadcasting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Request & Find Expert</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function NewRequestPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading request form...</div>}>
        <NewRequestForm />
      </Suspense>
    </ProtectedRoute>
  );
}
