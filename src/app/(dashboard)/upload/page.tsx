import { UploadArea } from './UploadArea';

export default async function UploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Upload Bill
        </h2>
        <p className="text-slate-500 mt-2">
          Upload a digital PDF bill to automatically extract details.
        </p>
      </div>

      <UploadArea />
    </div>
  );
}
