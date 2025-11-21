const treeInfo = require('../models/treeInfoModel');
const User = require('../models/userModel');

const addObject = async (req, res) => {
    try {
        const { object, userId } = req.body;
        // Resolve UUID to integer user ID if needed
        const userIdInt = await User.resolveUserIdFromAuthUid(userId) || userId;

        const newObject = await treeInfo.addObject({
            object: JSON.stringify(object),
            userId: userIdInt
        });

        res.status(201).json({
            message: 'Tree object added successfully',
            object: newObject
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error adding tree object'
        });
    }
};
const updateObject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // check if the family member exists
        const existingObject = await treeInfo.getObject(id);

        if (!existingObject) {
            return res.status(404).json({
                error: 'Object not found'
            });
        }

        // delete empty or undefined fields from updateData
        // for (let key in updateData) {
        //     if (updateData[key] === '' || updateData[key] === undefined) {
        //         delete updateData[key];
        //     }
        // }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No new data to update"
            });
        }

        const updatedObject = await treeInfo.updateObject(id, {object : JSON.stringify(updateData)});
        res.status(200).json({  // Changed to 200 status code
            message: 'Object updated successfully',
            object: updatedObject
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error updating tree object',
        });
    }
};

const getObject = async (req, res) => {
    try {
        const { id } = req.params;
        // Resolve UUID to integer user ID first
        const userId = await User.resolveUserIdFromAuthUid(id);
        if (!userId) {
            return res.status(404).json({ error: 'User not found' });
        }
        const retrievedObject = await treeInfo.getObject(userId);
        if (!retrievedObject) {
            return res.status(404).json({
                error: 'Object not found'
            });
        }
        console.log("Data sent from backend:", retrievedObject.object);
        
        res.status(200).json(retrievedObject);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error retrieving tree object',
            details: error.message
        });
    }
}

module.exports = { addObject, updateObject, getObject };
