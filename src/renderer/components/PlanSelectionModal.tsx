import { useState } from 'react';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'free' | 'pro') => void;
}

const PlanSelectionModal = ({ isOpen, onClose, onSelectPlan }: PlanSelectionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
      onClose();
    }
  };

  const freePlanFeatures = [
    'All core features',
    'Unlimited screenshots',
    'No watermark on images',
    'Device mockups',
    'Premium backgrounds & gradients',
    '4K export quality',
    'Share screenshots on social media',
    'New backgrounds every week',
    'Lifetime updates',
    'Community support',
  ];

  const proPlanFeatures = [
    'All core features',
    'Unlimited screenshots',
    'No watermark on images',
    'Device mockups',
    'Premium backgrounds & gradients',
    '4K export quality',
    'Share screenshots on social media',
    'New backgrounds every week',
     'Lifetime updates',
    'Export history',
    'Add custom backgrounds',
    'Priority support',
    
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-3xl w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-medium text-foreground mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Select the plan that best fits your needs
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <div
            onClick={() => setSelectedPlan('free')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:scale-[1.02] ${
              selectedPlan === 'free'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-medium text-foreground">Free</h3>
                <p className="text-3xl font-medium text-foreground mt-2">$0</p>
              </div>
              {selectedPlan === 'free' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check size={20} className="text-primary-foreground" />
                </div>
              )}
            </div>

            <ul className="space-y-3">
              {freePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:scale-[1.02] relative ${
              selectedPlan === 'pro'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-medium text-foreground">Pro</h3>
                <p className="text-3xl font-medium text-foreground mt-2">
                  $9.9<span className="text-base text-muted-foreground">/lifetime</span>
                </p>
              </div>
              {selectedPlan === 'pro' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check size={20} className="text-primary-foreground" />
                </div>
              )}
            </div>

            <ul className="space-y-3">
              {proPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Continue button */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            size="lg"
            className="min-w-[120px]"
          >
            Continue with {selectedPlan === 'free' ? 'Free' : 'Pro'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionModal;
