import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
  TransactionEvent,
} from "forta-agent";
import agent, {
  FUNCTION_NAME,
  DEPLOYER_ADDRESS,
  CONTRACT_ADDRESS
} from "./agent";
import {
  createAddress,
  TestTransactionEvent,
} from 'forta-agent-tools/lib/tests';

import {Interface} from "ethers/lib/utils";
import { encodeFunctionSignature } from "forta-agent-tools";

describe("New Agent Deployed Detector", () => {
  let handleTransaction: HandleTransaction;
  
  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there is no call to CreateAgent", async () => {
      const txEvent: TransactionEvent = new TestTransactionEvent().setFrom("0xaa").setTo("0xbb")

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
      
    });

    it("returns a finding if there is a CreateAgent function call from Nethermind Deployer Address", async () => {
      
      const signature:string = "createAgent(uint256, address, string, uint256[])";
      const selector:string = encodeFunctionSignature(signature);
      const Function_iface: Interface = new Interface(["function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds)"]);

      const param = {
        agentId:1,
        owner:createAddress("0xaa"),
        metadata:"hehe",
        chainIds:1
      }

      const txEvent: TransactionEvent = new TestTransactionEvent()
        .setFrom("0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8")
        .addTraces(
          {
            to:"0x61447385b019187daa48e91c55c02af1f1f3f863",
            input:Function_iface.encodeFunctionData("createAgent",[1,createAddress("0xaa"),"info",[1]])
          }
        )

      const findings = await handleTransaction(txEvent);
      console.log(findings);
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "New Agent  Deployed",
          description: `New agent from Nethermind deployer address deployed`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentId:"1",
          },
        })
      ]);
      // expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      // expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
      //   FUNCTION_NAME,
      //   CONTRACT_ADDRESS
      // );
    });
  });
});
