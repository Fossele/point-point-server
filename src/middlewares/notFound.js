export const notFound = (req, res) => {
    return res.status(404).json({ message: 'This route is not valid.', success: false });
}