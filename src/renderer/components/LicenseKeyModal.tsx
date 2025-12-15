import { useState } from 'react';
import { Button } from './ui/button';
import { X, Key } from 'lucide-react';
import { usePlan } from '../contexts/PlanContext';

interface LicenseKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LicenseKeyModal = ({ isOpen, onClose }: LicenseKeyModalProps) => {
  const { upgradeWithLicenseKey } = usePlan();
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    try {
      setIsLoading(true);
      await upgradeWithLicenseKey(licenseKey.trim());
      alert('Successfully upgraded to Pro!');
      onClose();
    } catch (err) {
      console.error('License key error:', err);
      setError('Invalid license key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Key size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Enter License Key</h2>
          <p className="text-sm text-muted-foreground">
            Enter your Pro license key to unlock all features
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full h-12 px-4 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              disabled={isLoading}
            />
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Activate'}
            </Button>
          </div>
        </form>

        {/* Buy link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Don't have a license key?{' '}
            <a
              href="https://polar.sh/your-product"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Purchase Pro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseKeyModal;
