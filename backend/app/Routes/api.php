<?php

use App\Controllers\AuthController;
use App\Controllers\AdminController;
use App\Controllers\BookingController;
use App\Controllers\CoachController;
use App\Controllers\CourseController;
use App\Controllers\ProfileController;
use App\Controllers\StudentController;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

return function (App $app): void {
    $app->group('/api', function (RouteCollectorProxy $group) {
        $group->post('/auth/login', [AuthController::class, 'login']);
        $group->post('/auth/logout', [AuthController::class, 'logout']);
        $group->post('/auth/register', [AuthController::class, 'register']);
        $group->get('/auth/check', [AuthController::class, 'check']);

        $group->get('/courses', [CourseController::class, 'index']);
        $group->get('/courses/{id}', [CourseController::class, 'show']);

        $group->get('/bookings', [BookingController::class, 'index']);
        $group->post('/bookings', [BookingController::class, 'store']);
        $group->post('/bookings/frozen', [BookingController::class, 'storeFrozen']);

        $group->put('/profile', [ProfileController::class, 'update']);
        $group->put('/profile/password', [ProfileController::class, 'changePassword']);
        $group->put('/profile/password/admin', [ProfileController::class, 'adminChangePassword']);

        $group->get('/students/{id}/cards', [StudentController::class, 'cards']);

        $group->group('/admin', function (RouteCollectorProxy $admin) {
            $admin->get('/home', [AdminController::class, 'home']);
            $admin->get('/courses', [AdminController::class, 'courses']);
            $admin->post('/courses', [AdminController::class, 'createCourse']);
            $admin->post('/courses/save', [AdminController::class, 'saveCourse']);
            $admin->put('/courses/{id}', [AdminController::class, 'updateCourse']);
            $admin->delete('/courses/{id}', [AdminController::class, 'deleteCourse']);
            $admin->post('/courses/{id}/start', [AdminController::class, 'startCourse']);
            $admin->post('/courses/{id}/cancel', [AdminController::class, 'cancelCourse']);
            $admin->get('/course-types', [AdminController::class, 'courseTypes']);

            $admin->get('/coaches', [AdminController::class, 'coaches']);
            $admin->get('/coaches/{id}/courses', [AdminController::class, 'coachCourses']);

            $admin->get('/students', [AdminController::class, 'students']);
            $admin->post('/students/lookup', [AdminController::class, 'studentLookup']);

            $admin->get('/transactions', [AdminController::class, 'transactions']);
            $admin->post('/transactions/query', [AdminController::class, 'transactions']);
            $admin->put('/transactions/{id}/payment', [AdminController::class, 'updateTransactionPayment']);

            $admin->post('/topup', [AdminController::class, 'topup']);
            $admin->post('/purchase', [AdminController::class, 'purchase']);

            $admin->post('/bookings/by-phone', [AdminController::class, 'bookByPhone']);
            $admin->post('/bookings/walk-in', [AdminController::class, 'walkIn']);
            $admin->post('/bookings/{id}/cancel', [AdminController::class, 'cancelBooking']);

            $admin->post('/users/save', [AdminController::class, 'saveUser']);
            $admin->post('/users', [AdminController::class, 'createUser']);
            $admin->put('/users/{id}', [AdminController::class, 'updateUser']);
            $admin->delete('/users/{id}', [AdminController::class, 'deleteUser']);

            $admin->get('/invoices/{id}', [AdminController::class, 'invoice']);
        });

        $group->group('/coach', function (RouteCollectorProxy $coach) {
            $coach->get('/{id}/overview', [CoachController::class, 'overview']);
            $coach->get('/courses/{id}', [CoachController::class, 'courseDetail']);
        });
    });
};
