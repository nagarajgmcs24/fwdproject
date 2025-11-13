import { useEffect, useState } from 'react';
import { MapPin, User, Phone, Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Ward {
  id: string;
  ward_number: string;
  ward_name_en: string;
  ward_name_hi: string;
  ward_name_kn: string;
  councillor_name: string;
  councillor_party: string;
  councillor_phone: string;
  city: string;
}

interface WardSelectorProps {
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
}

export function WardSelector({ selectedWardId, onSelectWard }: WardSelectorProps) {
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    loadWards();
  }, []);

  useEffect(() => {
    if (selectedWardId) {
      const ward = wards.find(w => w.id === selectedWardId);
      setSelectedWard(ward || null);
    }
  }, [selectedWardId, wards]);

  async function loadWards() {
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .order('ward_number');

    if (error) {
      console.error('Error loading wards:', error);
    } else {
      setWards(data || []);
    }
  }

  const getWardName = (ward: Ward) => {
    if (language === 'hi') return ward.ward_name_hi;
    if (language === 'kn') return ward.ward_name_kn;
    return ward.ward_name_en;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.selectWard}
        </label>
        <select
          value={selectedWardId || ''}
          onChange={(e) => onSelectWard(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.selectWard}</option>
          {wards.map((ward) => (
            <option key={ward.id} value={ward.id}>
              {ward.ward_number} - {getWardName(ward)}
            </option>
          ))}
        </select>
      </div>

      {selectedWard && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {t.wardInfo}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-green-600" />
              <span className="font-medium">{t.councillor}:</span>
              <span>{selectedWard.councillor_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Flag className="w-4 h-4 text-orange-600" />
              <span className="font-medium">{t.party}:</span>
              <span>{selectedWard.councillor_party}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{t.contact}:</span>
              <a href={`tel:${selectedWard.councillor_phone}`} className="text-blue-600 hover:underline">
                {selectedWard.councillor_phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
