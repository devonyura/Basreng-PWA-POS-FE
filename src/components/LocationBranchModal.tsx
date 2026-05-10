import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonContent,
  IonText,
  IonSpinner,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonToolbar,
} from '@ionic/react';
import { useAuth, BranchData } from '../hooks/useAuthCookie';
import { getBranches, getNearestBranch, Branch } from '../hooks/restAPIBranch';

interface LocationBranchModalProps {
  isOpen: boolean;
}

const LocationBranchModal: React.FC<LocationBranchModalProps> = ({ isOpen }) => {
  const { setBranchAfterLocation } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Menunggu lokasi akurat (6 detik)...');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startLocationProcess();
    }
  }, [isOpen]);

  const startLocationProcess = async () => {
    setLoading(true);
    setShowForm(false);
    setStatusMessage('Menunggu lokasi akurat (6 detik)...');

    // Ambil daftar semua cabang dulu untuk manual selection nanti
    try {
      const allBranches = await getBranches();
      if (Array.isArray(allBranches)) {
        setBranches(allBranches);
      }
    } catch (error) {
      console.error('Gagal mengambil daftar cabang:', error);
    }

    // Tunggu 6 detik sesuai permintaan
    setTimeout(async () => {
      setStatusMessage('Mengambil titik lokasi...');
      
      if (!navigator.geolocation) {
        setStatusMessage('Geolocation tidak didukung oleh browser ini.');
        setLoading(false);
        setShowForm(true);
        return;
      }

      // navigator.geolocation.getCurrentPosition(
        // async (position) => {
          // MOCK LOKASI UNTUK TESTING
          const latitude = -0.9021142776029807;
          const longitude = 119.87529591098223;
          // setStatusMessage(`Lokasi MOCK digunakan (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Mencari cabang terdekat...`);
          
          try {
            const nearest = await getNearestBranch(latitude, longitude);
            console.log("Nearest branch:", nearest);
            if (nearest && nearest.branch_id) {
              setSelectedBranchId(nearest.branch_id);
              setStatusMessage('Cabang terdekat ditemukan!');
            } else {
              setStatusMessage('Tidak ada cabang dalam radius 100m. Silahkan pilih manual.');
            }
          } catch (error) {
            console.error('Error fetching nearest branch:', error);
            setStatusMessage('Gagal mencari cabang terdekat. Silahkan pilih manual.');
          } finally {
            setLoading(false);
            setShowForm(true);
          }
        // },
        // (error) => {
        //   console.error('Geolocation error:', error);
        //   setStatusMessage('Gagal mendapatkan lokasi. Silahkan pilih manual.');
        //   setLoading(false);
        //   setShowForm(true);
        // },
        // { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      // );
    }, 6000);
  };

  const handleConfirm = () => {
    console.log("Confirming branch selection...", selectedBranchId);
    if (!selectedBranchId) return;

    const selectedBranch = branches.find(b => String(b.branch_id) === String(selectedBranchId));
    console.log("Selected branch object:", selectedBranch);
    
    if (selectedBranch && selectedBranch.branch_id) {
      setBranchAfterLocation(selectedBranch.branch_id, selectedBranch as BranchData);
      console.log("setBranchAfterLocation called with:", selectedBranch.branch_id);
    } else {
      console.error("Branch not found in branches list for ID:", selectedBranchId);
    }
  };

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false}>
      <IonContent className="ion-padding ion-text-center">
        <div style={{ marginTop: '20%', padding: '20px' }}>
          <IonText color="primary">
            <h2>Menentukan Lokasi Cabang</h2>
          </IonText>
          
          {loading && (
            <div style={{ marginTop: '30px' }}>
              <IonSpinner name="crescent" style={{ width: '60px', height: '60px' }} />
              <p>{statusMessage}</p>
            </div>
          )}

          {showForm && (
            <div style={{ marginTop: '30px' }}>
              <p>{statusMessage}</p>
              <IonItem lines="full" style={{ marginTop: '20px' }}>
                <IonLabel position="stacked">Pilih Cabang</IonLabel>
                <IonSelect 
                  value={selectedBranchId} 
                  placeholder="Pilih Cabang"
                  onIonChange={e => setSelectedBranchId(e.detail.value)}
                >
                  {branches.map(branch => (
                    <IonSelectOption key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
          )}
        </div>
      </IonContent>
      {showForm && (
        <IonFooter>
          <IonToolbar>
            <IonButton 
              expand="full" 
              onClick={handleConfirm} 
              disabled={!selectedBranchId}
              color="primary"
            >
              OK - Mulai Bekerja
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonModal>
  );
};

export default LocationBranchModal;
