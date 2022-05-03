import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import agent, {
  FUNCTION_NAME,
  DEPLOYER_ADDRESS,
  CONTRACT_ADDRESS
} from "./agent";

describe("New Agent Deployed Detector", () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there is no call to CreateAgent", async () => {
      mockTxEvent.filterFunction = jest.fn().mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        FUNCTION_NAME,
        CONTRACT_ADDRESS
      );
    });

    it("returns a finding if there is a CreateAgent function call from Nethermind Deployer Address", async () => {
      const mockTetherTransferEvent = {
        args: {
          from: DEPLOYER_ADDRESS,
          to: CONTRACT_ADDRESS,
          
        },
      };
      mockTxEvent.filterFunction = jest
        .fn()
        .mockReturnValue([mockTetherTransferEvent]);

      const findings = await handleTransaction(mockTxEvent);
      console.log(findings);
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "New Agent  Deployed",
          description: `New agent from Nethermind deployer address deployed`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            "to":CONTRACT_ADDRESS,
            "from":DEPLOYER_ADDRESS
          },
        })
      ]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        FUNCTION_NAME,
        CONTRACT_ADDRESS
      );
    });
  });
});
