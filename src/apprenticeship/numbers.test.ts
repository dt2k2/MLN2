import { describe, expect, it } from "vitest";
import { R2, R3, R4, R5, accumulationFundAfterPurchase, computeR5, computeR6 } from "./numbers";

describe("Round 2 — c/v/m", () => {
  it("phân loại đúng giá trị chuyển dịch và giá trị mới", () => {
    expect(R2.c).toBe(50);
    expect(R2.v).toBe(30);
    expect(R2.m).toBe(30);
    expect(R2.total).toBe(110);
  });
});

describe("Round 3 — thặng dư tuyệt đối", () => {
  it("kéo dài ngày làm 8→10h", () => {
    expect(R3.base.mRate).toBe(1.0);
    expect(R3.extended.m).toBe(60);
    expect(R3.extended.mRate).toBe(1.5);
    expect(R3.extended.v).toBe(R3.base.v);
  });
});

describe("Round 4 — máy móc và chuẩn xã hội", () => {
  it("sản lượng tăng nhưng newValue giữ nguyên", () => {
    expect(R4.pre.output).toBe(8);
    expect(R4.post.output).toBe(12);
    expect(R4.post.newValue).toBe(R4.pre.newValue);
    expect(R4.post.hoursPerUnit).toBeCloseTo(0.6667, 3);
    expect(R4.socialLaborTime.after).toBeCloseTo(0.6667, 3);
    expect(R4.necessaryLabor.after).toBe(3.5);
    expect(R4.surplusLabor.after).toBe(4.5);
  });
});

describe("Round 5 — khủng hoảng thừa", () => {
  it("cầu sụt còn 70 → tồn kho", () => {
    const r = computeR5(100);
    expect(r.produced.totalValue).toBe(1000);
    expect(r.produced.m).toBe(300);
    expect(r.sold).toBe(70);
    expect(r.unsold).toBe(30);
    expect(r.revenue).toBe(700);
    expect(r.costs).toBe(700);
    expect(r.realizedProfit).toBe(0);
  });
  it("output 80 bán được 70, tồn 10", () => {
    const r = computeR5(80);
    expect(r.sold).toBe(70);
    expect(r.unsold).toBe(10);
  });
  it("output 140 tồn 70", () => {
    const r = computeR5(140);
    expect(r.unsold).toBe(70);
  });
  it("chỉ có 3 lựa chọn", () => {
    expect(R5.options).toEqual([80, 100, 140]);
  });
});

describe("Round 6 — tích lũy", () => {
  it("bốn tỷ lệ giữ lại", () => {
    expect(computeR6(25)).toMatchObject({
      retained: 10,
      ownerConsumption: 30,
      canBuyMachine: false,
    });
    expect(computeR6(50)).toMatchObject({
      retained: 20,
      ownerConsumption: 20,
      canBuyMachine: false,
    });
    expect(computeR6(75)).toMatchObject({
      retained: 30,
      ownerConsumption: 10,
      canBuyMachine: true,
    });
    expect(computeR6(100)).toMatchObject({
      retained: 40,
      ownerConsumption: 0,
      canBuyMachine: true,
    });
    expect(accumulationFundAfterPurchase(75)).toBe(0);
    expect(accumulationFundAfterPurchase(100)).toBe(10);
  });
});
