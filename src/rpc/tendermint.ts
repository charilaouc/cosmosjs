import { RPC } from "../core/rpc";
import { Context } from "../core/context";
import { Buffer } from "buffer/";
import bigInteger from "big-integer";
import { JSONRPC } from "./types";
import { ResultStatus } from "./status";
import { ResultABCIInfo, ResultABCIQuery, ABCIQueryOptions } from "./abci";
import { ResultBroadcastTx, ResultBroadcastTxCommit } from "./tx";

export class TendermintRPC extends RPC {
  constructor(context: Context) {
    super(context);
  }

  public async status(): Promise<ResultStatus> {
    const result = await this.instance.get<JSONRPC>("/status");
    if (result.data.error) {
      const error = result.data.error;
      throw new Error(
        `code: ${error.code},  message: ${error.message}, data: ${error.data}`
      );
    }
    return ResultStatus.fromJSON(result.data);
  }

  public async abciInfo(): Promise<ResultABCIInfo> {
    const result = await this.instance.get<JSONRPC>("/abci_info");
    if (result.data.error) {
      const error = result.data.error;
      throw new Error(
        `code: ${error.code},  message: ${error.message}, data: ${error.data}`
      );
    }
    return ResultABCIInfo.fromJSON(result.data);
  }

  public async abciQuery(
    path: string,
    data: Uint8Array | string,
    opts?: ABCIQueryOptions
  ): Promise<ResultABCIQuery> {
    const height = opts ? bigInteger(opts.height as any) : bigInteger(0);
    const prove = opts ? opts.prove : false;
    let bz: Buffer;
    if (typeof data === "string") {
      bz =
        data.indexOf("0x") === 0
          ? Buffer.from(data.replace("0x", ""), "hex")
          : Buffer.from(data);
    } else {
      bz = Buffer.from(data);
    }

    const result = await this.instance.get<JSONRPC>(
      `/abci_query?path="${path}&data=0x${bz.toString(
        "hex"
      )}&prove=${prove}&height=${height.toString()}"`
    );
    if (result.data.error) {
      const error = result.data.error;
      throw new Error(
        `code: ${error.code},  message: ${error.message}, data: ${error.data}`
      );
    }
    return ResultABCIQuery.fromJSON(result.data);
  }

  public async broadcastTx(
    tx: Uint8Array,
    mode: "sync" | "async"
  ): Promise<ResultBroadcastTx> {
    const hex = Buffer.from(tx).toString("hex");
    const result = await this.instance.get(`/broadcast_tx_${mode}`, {
      params: {
        tx: "0x" + hex
      }
    });
    if (result.data.error) {
      const error = result.data.error;
      throw new Error(
        `code: ${error.code},  message: ${error.message}, data: ${error.data}`
      );
    }
    return ResultBroadcastTx.fromJSON(result.data, mode);
  }

  public async broadcastTxCommit(
    tx: Uint8Array
  ): Promise<ResultBroadcastTxCommit> {
    const hex = Buffer.from(tx).toString("hex");
    const result = await this.instance.get(`/broadcast_tx_commit`, {
      params: {
        tx: "0x" + hex
      }
    });
    if (result.data.error) {
      const error = result.data.error;
      throw new Error(
        `code: ${error.code},  message: ${error.message}, data: ${error.data}`
      );
    }
    return ResultBroadcastTxCommit.fromJSON(result.data);
  }
}
