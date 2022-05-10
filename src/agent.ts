import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const FUNCTION_NAME = "function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds)";
export const DEPLOYER_ADDRESS = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8".toLowerCase();
export const CONTRACT_ADDRESS = "0x61447385b019187daa48e91c55c02af1f1f3f863";
let findingsCount = 0;

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];
  console.log(txEvent);
  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;
  if(txEvent.from.toLowerCase() !== DEPLOYER_ADDRESS.toLowerCase())
    return findings;
  console.log("hereeeeeeeeeeeeee");
  // filter the transaction logs for CreateAgent function call
  const deployEvents = txEvent.filterFunction(
    [FUNCTION_NAME],
    CONTRACT_ADDRESS
  );
  console.log(deployEvents);
  deployEvents.forEach((deployEvent) => {
    // console.log(deployEvent.args.agentId);
    // console.log(deployEvent.args);
      findings.push(
        Finding.fromObject({
          name: "New Agent  Deployed",
          description: `New agent from Nethermind deployer address deployed`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            "agentId":deployEvent.args.agentId.toString(),
            
          },
        })
      );
      findingsCount++;
    
  });

  return findings;
};

// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

export default {
  handleTransaction,
  // handleBlock
};
