import { create } from 'zustand';

interface Coordinates {
    latitude: number | null;
    longitude: number | null;
}

type Status = "undetermined" | "granted" | "denied" | "error" | null;

interface LocationState {
    location: Coordinates | null;
    errorMsg: string | null;
    status: Status;
    setLocation: (loc: Coordinates) => void;
    setStatus: (st: Status) => void;
    setErrorMsg: (msg: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    location: null,
    errorMsg: null,
    status: "undetermined",
    setLocation: (loc) => set({ location: loc }),
    setStatus: (st) => set({ status: st }),
    setErrorMsg: (msg) => set({ errorMsg: msg })
}));

export const useUserLocation = () => {
    const { location, status, errorMsg, setLocation, setStatus, setErrorMsg } = useLocationStore();

    const requestLocation = (): Promise<Coordinates | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setStatus("error");
                setErrorMsg("Geolocation is not supported by your browser");
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setLocation(coords);
                    setStatus("granted");
                    setErrorMsg(null);
                    resolve(coords);
                },
                (error) => {
                    setStatus("denied");
                    setErrorMsg(error.message);
                    resolve(null);
                }
            );
        });
    };

    return { location, status, errorMsg, requestLocation };
};
