import assert from "node:assert/strict";
import { test } from "node:test";
import { getBankDetails } from "@/server/commerce/bank";
import { requireSession, validateAttempt } from "@/server/commerce/order-access";
test("bank configuration requires explicit enablement and every required value",()=>{
  const names=["BANK_TRANSFER_ENABLED","BANK_NAME","BANK_ACCOUNT_HOLDER","BANK_ACCOUNT_TYPE","BANK_ACCOUNT_NUMBER"];
  const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  try{for(const name of names)delete process.env[name];assert.equal(getBankDetails(),null);process.env.BANK_TRANSFER_ENABLED="true";assert.equal(getBankDetails(),null);for(const name of names.slice(1))process.env[name]="ISOLATED TEST ONLY";assert.ok(getBankDetails());process.env.BANK_TRANSFER_ENABLED="false";assert.equal(getBankDetails(),null);}finally{for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];}}
});
test("invalid guest sessions and idempotency keys are rejected",()=>{for(const value of [undefined,"", "predictable"])assert.throws(()=>requireSession(value));assert.throws(()=>validateAttempt("order-1"));assert.equal(requireSession("a".repeat(64)).length,64);});
