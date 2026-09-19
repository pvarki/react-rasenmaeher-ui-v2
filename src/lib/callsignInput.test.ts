import { describe, expect, it } from "vitest";
import { callsignsFromSeries, parseCallsignList } from "./callsignInput";

describe("callsignsFromSeries", () => {
  it("numbers from where it is told to", () => {
    expect(callsignsFromSeries("OTTER", 3, 7)).toEqual([
      "OTTER7",
      "OTTER8",
      "OTTER9",
    ]);
  });

  it("refuses to make anything from nothing", () => {
    expect(callsignsFromSeries("", 5, 1)).toEqual([]);
    expect(callsignsFromSeries("OTTER", 0, 1)).toEqual([]);
  });
});

describe("parseCallsignList", () => {
  it("takes one name per line", () => {
    expect(parseCallsignList("KORPPI\nKIRVES\n")).toEqual(["KORPPI", "KIRVES"]);
  });

  it("takes the separators people actually paste", () => {
    expect(parseCallsignList("KORPPI, KIRVES\nHAUKKA;SUSI\tILVES")).toEqual([
      "KORPPI",
      "HAUKKA",
    ]);
  });

  it("reads only the first column of a spreadsheet export", () => {
    const csv =
      'callsign,approvecode,mdm_device_name\n"KORPPI","A1B2","KORPPI@A1B2"\n';
    expect(parseCallsignList(csv)).toEqual(["KORPPI"]);
  });

  it("drops a repeat rather than spending the name twice", () => {
    expect(parseCallsignList("KORPPI\nkorppi\nKIRVES")).toEqual([
      "KORPPI",
      "KIRVES",
    ]);
  });

  it("ignores blank lines", () => {
    expect(parseCallsignList("\n\nKORPPI\n\n  \n")).toEqual(["KORPPI"]);
  });
});
