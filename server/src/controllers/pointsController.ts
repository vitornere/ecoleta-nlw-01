import { Request, Response } from 'express';
import knex from '../database/connection';


class PointsController {
    async index(req: Request, res: Response) {
        const {city, uf, items} = req.query;

        let points = []
        console.log(req.query)
        if (city || uf || items) {
            if (items) {
                const parsedItems = String(items)
                    .split(',')
                    .map(item => Number(item.trim()));
                
                points = await knex('points')
                    .join('points_items', 'points.id', '=', 'points_items.points_id')
                    .whereIn('points_items.items_id', parsedItems)
                    .where('city', String(city))
                    .where('uf', String(uf))
                    .distinct()
                    .select('points.*');
            } else {
                points = await knex('points')
                    .where('city', String(city))
                    .where('uf', String(uf))
                    .distinct()
                    .select('points.*');
            }
        } else {
            points = await knex('points').select('*');
        }

        const serializedPoints = points.map(point => {
            return {...point, image: `http://192.168.0.6:3333/uploads/${point.image}`};
        });

        return res.json(serializedPoints);
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return res.status(400).json({'message': 'Point not found!'});
        }

        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.items_id')
            .where('points_items.points_id', id)
            .select('items.title');
        
        const serializedPoint = {
            ...point,
            image: `http://192.168.0.6:3333/uploads/${point.image}`
        };

        return res.json({ point: serializedPoint, items });
    }

    async create(req: Request, res: Response) {
        console.log(req.body)
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;
    
        const trx = await knex.transaction();

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
    
        const insertedIds = await trx('points').insert(point);
    
        const points_id = insertedIds[0];
    
        const pointsItems = items
            .split(',')
            .map((item:string) => Number(item.trim()))
            .map((items_id: number) => {
            return {
                items_id,
                points_id
            }
        });
    
        await trx('points_items').insert(pointsItems);

        await trx.commit();
    
        return res.json({
            id: points_id,
            ...point
        });
    }
}

export default PointsController