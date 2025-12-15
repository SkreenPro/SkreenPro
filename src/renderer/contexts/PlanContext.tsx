import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export type PlanType = 'free' | 'pro';

interface UserPlan {
  plan: PlanType;
  licenseKey?: string;
  expiresAt?: string;
}

interface PlanContextType {
  userPlan: UserPlan | null;
  loading: boolean;
  selectPlan: (plan: PlanType) => Promise<void>;
  verifyLicenseKey: (licenseKey: string) => Promise<boolean>;
  upgradeWithLicenseKey: (licenseKey: string) => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false - no blocking loading

  useEffect(() => {
    if (user) {
      // Fetch plan in background without blocking UI
      fetchUserPlan();
    } else {
      setUserPlan(null);
    }
  }, [user]);

  const fetchUserPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no plan exists, create default free plan silently in background
        if (error.code === 'PGRST116') {
          await createDefaultPlan();
        } else {
          console.error('Error fetching user plan:', error);
        }
      } else {
        setUserPlan({
          plan: data.plan_type,
          licenseKey: data.license_key,
          expiresAt: data.expires_at,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserPlan:', error);
    }
  };

  const createDefaultPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_plans')
        .insert([
          {
            user_id: user.id,
            plan_type: 'free',
            license_key: null,
            expires_at: null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating default plan:', error);
      } else {
        setUserPlan({
          plan: data.plan_type,
          licenseKey: data.license_key,
          expiresAt: data.expires_at,
        });
      }
    } catch (error) {
      console.error('Error in createDefaultPlan:', error);
    }
  };

  const selectPlan = async (plan: PlanType) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_plans')
        .upsert(
          {
            user_id: user.id,
            plan_type: plan,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error selecting plan:', error);
        throw error;
      }

      setUserPlan({
        plan: data.plan_type,
        licenseKey: data.license_key,
        expiresAt: data.expires_at,
      });
    } catch (error) {
      console.error('Error in selectPlan:', error);
      throw error;
    }
  };

  const verifyLicenseKey = async (licenseKey: string): Promise<boolean> => {
    // TODO: Implement Polar.sh license key verification
    // For now, return true if key is not empty
    return licenseKey.length > 0;
  };

  const upgradeWithLicenseKey = async (licenseKey: string) => {
    if (!user) return;

    try {
      // Verify license key with Polar.sh
      const isValid = await verifyLicenseKey(licenseKey);

      if (!isValid) {
        throw new Error('Invalid license key');
      }

      // Update user plan to pro
      const { data, error } = await supabase
        .from('user_plans')
        .upsert(
          {
            user_id: user.id,
            plan_type: 'pro',
            license_key: licenseKey,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error upgrading with license key:', error);
        throw error;
      }

      setUserPlan({
        plan: data.plan_type,
        licenseKey: data.license_key,
        expiresAt: data.expires_at,
      });
    } catch (error) {
      console.error('Error in upgradeWithLicenseKey:', error);
      throw error;
    }
  };

  return (
    <PlanContext.Provider
      value={{
        userPlan,
        loading,
        selectPlan,
        verifyLicenseKey,
        upgradeWithLicenseKey,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
