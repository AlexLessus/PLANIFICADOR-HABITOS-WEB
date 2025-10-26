import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Modal para editar tareas del calendario
 * @param {Object} props
 * @param {boolean} props.open - Estado de apertura del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Object} props.task - Objeto con los datos de la tarea
 * @param {Function} props.onTaskChange - Función para manejar cambios en los campos
 * @param {Function} props.onDateChange - Función para manejar cambios en la fecha
 * @param {Function} props.onUpdate - Función para guardar los cambios
 * @param {Function} props.onDelete - Función para eliminar la tarea
 */
const EditTaskModal = ({
    open,
    onClose,
    task,
    onTaskChange,
    onDateChange,
    onUpdate,
    onDelete
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon />
                    <Typography variant="h6">Editar Tarea</Typography>
                </Box>
                <IconButton 
                    onClick={onDelete} 
                    color="error"
                    title="Eliminar tarea"
                >
                    <DeleteIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <TextField
                    autoFocus
                    margin="normal"
                    label="Título de la Tarea"
                    name="title"
                    fullWidth
                    variant="filled"
                    value={task.title}
                    onChange={onTaskChange}
                    required
                />

                <TextField
                    margin="normal"
                    label="Descripción (Opcional)"
                    name="description"
                    fullWidth
                    variant="filled"
                    multiline
                    maxRows={3}
                    value={task.description}
                    onChange={onTaskChange}
                />

                <FormControl fullWidth margin="normal" variant="filled" color="primary">
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                        name="priority"
                        value={task.priority}
                        label="Prioridad"
                        onChange={onTaskChange}
                    >
                        <MenuItem value="Baja">Baja</MenuItem>
                        <MenuItem value="Media">Media</MenuItem>
                        <MenuItem value="Alta">Alta</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" variant="filled">
                    <InputLabel>Estado</InputLabel>
                    <Select
                        name="status"
                        value={task.status}
                        label="Estado"
                        onChange={onTaskChange}
                    >
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Completada">Completada</MenuItem>
                    </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Fecha de Vencimiento"
                        value={task.due_date}
                        onChange={onDateChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                margin="normal"
                                variant="standard"
                            />
                        )}
                    />
                </LocalizationProvider>

                {/* Información adicional */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        💡 Tip: Haz click en el ícono de papelera para eliminar esta tarea
                    </Typography>
                </Box>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={onUpdate} variant="contained" color="primary">
                    Guardar Cambios
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditTaskModal;
