const computeSettlements = (netMap)=>{
    const eps = 0.005;
    const creditors = [];
    const debtors = [];
    for(const [user, net] of Object.entries(netMap)){
        const n = Math.round(net*100)/100;
        if(n > eps){
            creditors.push({user, amount: n});
        }
        else if(n < -eps){
            debtors.push({user, amount: -n});
        }
    }
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a,b) => b.amount - a.amount);

    const settlements = [];
    let i = 0, j = 0;
    while(i < debtors.length && j < creditors.length){
        const pay = Math.min(debtors[i].amount, creditors[j].amount);
        settlements.push({
            from: debtors[i].user,
            to: creditors[j].user,
            amount: Math.round(pay*100)/100
        });
        debtors[i].amount -= pay;
        creditors[j].amount -= pay;
        if(debtors[i].amount < eps)i++;
        if(creditors[j].amount < eps)j++;
    }

    return settlements;
}

module.exports = {computeSettlements};