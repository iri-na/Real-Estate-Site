import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {image, title, description, price, guests, beds, baths} =
                req.body;
            console.log(req.body);

            const home = await prisma.home.create({
                data: {
                    image,
                    title,
                    description,
                    price,
                    guests,
                    beds,
                    baths,
                    ownerId: 'cl864r44a0025zlrhinbymcl5', // TO DO: generalise
                },
            });

            res.status(200).json(home);

        } catch (e) {
            res.status(500).json({message: 'Something went wrong'});
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res
            .status(405)
            .json({message: `HTTP method ${req.method} is not supported.`});
    }
}