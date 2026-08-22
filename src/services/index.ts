export { ApiClient } from './api';
export { studentService, type Student, type CreateStudentInput, type AuthSession } from './students';
export { courseService, type Course, type CreateCourseInput, type DaySchedule } from './courses';
export { enrolmentService, type Enrolment } from './enrolments';
export { classTimetableService, type ClassTimetableSlot } from './classTimetables';
export {
  personalTimetableService,
  type PersonalTimetableEntry,
  type SavePersonalTimetableEntry,
} from './personalTimetables';
export { mealService, type Meal, type MealDish, type MealsByDate } from './meals';
