import Transaction from '../models/Transaction';
import moment from 'moment';
import { Request, Response } from 'express';
import cache from '../database/cache';

export default class TransactionController {

    public static async create(req: Request, res: Response) {
        const { date, income, outflow, description } = req.body;
        const id = req.userId;
        
        try {
            const newDate = moment(date, "MM-DD-YYYY");
            
            if (!newDate) {
                return res.status(400).send({ error: 'Invalid date, try mm/dd/yyyy' });
            }

            if (!description) {
                return res.status(400).send({ error: 'Fields are empty or nulls' });
            }

            if (Number.isNaN(income) || Number.isNaN(outflow)) {
                return res.status(400).send({ error: 'Income and outflow must be of type Number' });
            }

            if (income < 0 || outflow < 0) {
                return res.status(400).send({ error: 'Income and outflow are with invalid values' });
            }

            const transaction = await Transaction.create({
                user: id,
                date: newDate,
                income,
                outflow,
                description
            });

            return res.send({
                id: transaction._id,
                date: transaction.date,
                income: transaction.income,
                outflow: transaction.outflow,
                description: transaction.description
            });

        } catch(err) {
            return res.status(400).send({ error: 'Transaction creation failed' });
        }
    }

    public static async update(req: Request, res: Response) {
        const { date, income, outflow, description } = req.body;
        const transactionId = req.params.transactionId;

        try {
            const newDate = moment(date, "MM-DD-YYYY");
            
            if (!newDate) {
                return res.status(400).send({ error: 'Invalid date, try mm/dd/yyyy' });
            }

            if (!description) {
                return res.status(400).send({ error: 'Fields are empty or nulls' });
            }

            if (Number.isNaN(income) || Number.isNaN(outflow)) {
                return res.status(400).send({ error: 'Income and outflow must be of type Number' });
            }

            if (income < 0 || outflow < 0) {
                return res.status(400).send({ error: 'Income and outflow are with invalid values' });
            }

            const transactionUpdated = await Transaction.findByIdAndUpdate(transactionId, {
                date: newDate,
                income,
                outflow,
                description
            }, { new: true });

            return res.send({
                id: transactionUpdated._id,
                date: transactionUpdated.date,
                income: transactionUpdated.income,
                outflow: transactionUpdated.outflow,
                description: transactionUpdated.description
            });

        } catch(err) {
            return res.status(400).send({ error: 'Update transaction failed' });
        }
    }

    public static async listTransaction(req: Request, res: Response) {
        const transactionId = req.params.transactionId;

        try {
            const transaction = await Transaction.findById(transactionId);

            return res.send({
                date: transaction.date,
                income: transaction.income,
                outflow: transaction.outflow,
                description: transaction.description
            });
        } catch(err) {
            return res.status(400).send({ error: 'Search error' });
        }
    }

    public static async delete(req: Request, res: Response) {
        const transactionId = req.params.transactionId;

        try {
            await Transaction.findByIdAndRemove(transactionId);

            return res.send();

        } catch(err) {
            return res.status(400).send({ error: 'Error deleting transaction' });
        }
    }

    public static async listUserTransactions(req: Request, res: Response) {
        const { userId } = req;
        const { page = 1 } = req.query;
        const limit = 10;
        const skip = limit * (page as number - 1);

        try {
            const records = await Transaction.find({ user: userId }, 'income outflow')
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await cache.get(`balance:${userId}`);

            if (total) {
                return res.send({
                    records,
                    recordsTotal: records.length,
                    pageNumber: Number(page),
                    pageSize: limit,
                    balance: Number(total)
                });

            } else {
                const incomeList = records.map((transaction: any) => transaction.income);
                const outflowList = records.map((transaction: any) => transaction.outflow);

                const incomeTotal = incomeList.reduce((total: number, currentElement: number) => {
                    return total + currentElement;
                });

                const outflowTotal = outflowList.reduce((total: number, currentElement: number) => {
                    return total + currentElement;
                });

                const total = incomeTotal - outflowTotal;

                await cache.set(`balance:${userId}`, total);

                return res.send({
                    records,
                    recordsTotal: records.length,
                    pageNumber: Number(page),
                    pageSize: limit,
                    balance: total
                });
            }
        } catch(err) {
            return res.status(400).send({ error: 'Search error' });
        }
    }
}