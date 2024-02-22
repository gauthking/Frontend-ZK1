export interface txnInterface {
    transactionType: string;
    currentSignCount: number;
    currentSetAccountThreshold: number;
    signedOwners: any;
    txnAmount: number;
    recipientAddress: string;
    paymaster: boolean;
    _id: string;
    __v: number;
}

export interface accountGuardians {
    safeAddress: string;
    assignedBy: string;
    guardianAddress: string;
    currentSetThreshold: number;
    approvalSignatures: any[];
    approvedStatus: string;
    rejectedBy: string;
    assignedAt: any;
}

export interface sidebarProps {
    address: string;
    safeName: string;
    threshold: number;
    setHandleCreateTxnComponent: Dispatch<SetStateAction<boolean>>;
    handleCreateTxnComponent: boolean;
    handleSignTxnComponent: boolean;
    setHandleSignTxnComponent: Dispatch<SetStateAction<boolean>>;
    setTxnPayload: Dispatch<SetStateAction<txnInterface | undefined>>;
}

export interface transactionListInterface {
    address: string;
    threshold: number;
    setTxnPayload: Dispatch<SetStateAction<txnInterface | undefined>>;
    setHandleSignTxnComponent: Dispatch<SetStateAction<boolean>>;
    handleSignTxnComponent: boolean;
}

export interface SignTxnBoxProps {
    owners: Array<string | null | undefined>
    txnData: txnInterface | undefined;
    setHandleSignTxnComponent: Dispatch<SetStateAction<boolean>>;
    safeAddress: string;
    threshold: number;
}

export interface CreateTxnBoxProps {
    safeAddress: string;
    eoaAddress: string | null;
}
