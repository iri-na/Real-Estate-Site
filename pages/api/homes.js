import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    if (req.method === 'POST') {
        try {
            const {image, title, description, price, guests, beds, baths} =
                req.body;
            console.log(req.body);

            // Retrieve the current authenticated user
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            const home = await prisma.home.create({
                data: {
                    image,
                    title,
                    description,
                    price,
                    guests,
                    beds,
                    baths,
                    ownerId: user.id,
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