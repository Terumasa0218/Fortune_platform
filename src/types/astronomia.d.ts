declare module "astronomia" {
  export const apparent: {
    eclipticAberration: (longitude: number, latitude: number, jde: number) => [number, number];
  };

  export const base: {
    JDEToJulianYear: (jde: number) => number;
    J2000Century: (jde: number) => number;
    lightTime: (distance: number) => number;
    pmod: (value: number, range: number) => number;
    sincos: (value: number) => [number, number];
  };

  export const coord: {
    Equatorial: new (ra?: number, dec?: number) => {
      ra: number;
      dec: number;
      toEcliptic: (obliquity: number) => { lon: number; lat: number };
    };
  };

  export const julian: {
    CalendarGregorianToJD: (year: number, month: number, day: number) => number;
  };

  export const solar: {
    apparentLongitude: (jde: number) => number;
  };

  export const moonposition: {
    position: (jde: number) => {
      lon: number;
      lat: number;
      range: number;
    };
  };

  export const nutation: {
    meanObliquity: (jde: number) => number;
    nutation: (jde: number) => [number, number];
  };

  export const planetposition: {
    Planet: new (planet: unknown) => {
      position: (jde: number) => {
        lon: number;
        lat: number;
        range: number;
      };
    };
    toFK5: (longitude: number, latitude: number, jde: number) => {
      lon: number;
      lat: number;
    };
  };

  export const pluto: {
    astrometric: (
      jde: number,
      earth: { position: (jde: number) => { lon: number; lat: number; range: number } },
    ) => { ra: number; dec: number };
  };

  export const precess: {
    position: (
      equatorial: { ra: number; dec: number },
      epochFrom: number,
      epochTo: number,
      properMotionRa: number,
      properMotionDec: number,
    ) => { ra: number; dec: number };
  };

  export const sidereal: {
    apparent: (jde: number) => number;
  };
}

declare module "astronomia/data" {
  const data: {
    vsop87Bearth: unknown;
    vsop87Bmercury: unknown;
    vsop87Bvenus: unknown;
    vsop87Bmars: unknown;
    vsop87Bjupiter: unknown;
    vsop87Bsaturn: unknown;
    vsop87Buranus: unknown;
    vsop87Bneptune: unknown;
  };

  export default data;
}
